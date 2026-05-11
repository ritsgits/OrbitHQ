"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";
import WorkspaceMember from "@/models/WorkspaceMember";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

async function getWorkspaceId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await connectDB();
  const membership = await WorkspaceMember.findOne({ userId: session.user.id });
  if (!membership) throw new Error("No workspace membership found");
  
  return membership.workspaceId;
}

export async function getDashboardStats() {
  try {
    const workspaceId = await getWorkspaceId();

    const [projects, tasks, activities] = await Promise.all([
      Project.find({ workspaceId }),
      Task.find({ workspaceId }),
      ActivityLog.find({ workspaceId })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("userId", "name email image")
    ]);

    const now = new Date();
    const stats = {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "COMPLETED").length,
      pendingTasks: tasks.filter(t => t.status !== "COMPLETED").length,
      overdueTasks: tasks.filter(t => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now).length,
    };

    return { stats, recentActivities: JSON.parse(JSON.stringify(activities)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getChartData() {
  try {
    const workspaceId = await getWorkspaceId();

    // 1. Task Completion Trends (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, "MMM dd"),
        rawDate: date,
      };
    }).reverse();

    const taskTrends = await Promise.all(
      last7Days.map(async (day) => {
        const count = await Task.countDocuments({
          workspaceId,
          status: "COMPLETED",
          updatedAt: {
            $gte: startOfDay(day.rawDate),
            $lte: endOfDay(day.rawDate),
          },
        });
        return { name: day.date, completed: count };
      })
    );

    // 2. Project Status Distribution
    const projects = await Project.find({ workspaceId });
    const projectDistribution = [
      { name: "To Do", value: projects.filter(p => p.status === "TODO").length },
      { name: "In Progress", value: projects.filter(p => p.status === "IN_PROGRESS").length },
      { name: "Completed", value: projects.filter(p => p.status === "COMPLETED").length },
    ];

    // 3. Team Workload (Tasks per member)
    const members = await WorkspaceMember.find({ workspaceId }).populate("userId", "name");
    const workloadData = await Promise.all(
      members.map(async (member) => {
        const taskCount = await Task.countDocuments({
          workspaceId,
          assignedTo: member.userId._id,
          status: { $ne: "COMPLETED" }
        });
        return {
          name: (member.userId as any).name,
          tasks: taskCount
        };
      })
    );

    return { taskTrends, projectDistribution, workloadData };
  } catch (error: any) {
    return { error: error.message };
  }
}
