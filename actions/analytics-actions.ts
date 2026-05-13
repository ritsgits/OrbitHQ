"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import ActivityLog from "@/models/ActivityLog";
import WorkspaceMember from "@/models/WorkspaceMember";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { getProjectDerivedStatus } from "@/utils/project-helpers";

import { cache } from "react";

const getWorkspaceId = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await connectDB();
  const membership = await WorkspaceMember.findOne({ userId: session.user.id }).lean();
  if (!membership) throw new Error("No workspace membership found");
  
  return membership.workspaceId;
});

export async function getDashboardStats() {
  try {
    const workspaceId = await getWorkspaceId();
    const now = new Date();

    const [
      totalProjects,
      taskStats,
      activities
    ] = await Promise.all([
      Project.countDocuments({ workspaceId }),
      Task.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
            overdue: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $ne: ["$status", "COMPLETED"] },
                      { $lt: ["$dueDate", now] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      ActivityLog.find({ workspaceId })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("userId", "name email image")
        .lean()
    ]);

    const tStats = taskStats[0] || { total: 0, completed: 0, overdue: 0 };
    const stats = {
      totalProjects,
      totalTasks: tStats.total,
      completedTasks: tStats.completed,
      pendingTasks: tStats.total - tStats.completed,
      overdueTasks: tStats.overdue,
    };

    return { stats, recentActivities: JSON.parse(JSON.stringify(activities)) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getChartData() {
  try {
    const workspaceId = await getWorkspaceId();
    const sevenDaysAgo = subDays(new Date(), 7);

    // Run all top-level queries in parallel
    const [
      taskTrendStats,
      projects,
      projectStats,
      members,
      workloadStats,
      productivityStats
    ] = await Promise.all([
      // 1. Optimized Task Completion Trends (Single aggregation)
      Task.aggregate([
        { 
          $match: { 
            workspaceId, 
            status: "COMPLETED", 
            updatedAt: { $gte: startOfDay(sevenDaysAgo) } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 }
          }
        }
      ]),
      // 2. Fetch projects and their stats
      Project.find({ workspaceId }).lean(),
      Task.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: "$projectId",
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
            todo: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
          }
        }
      ]),
      // 3. Team data
      WorkspaceMember.find({ workspaceId }).populate("userId", "name email image").lean(),
      Task.aggregate([
        { 
          $match: { 
            workspaceId, 
            status: { $ne: "COMPLETED" },
            assignedTo: { $exists: true, $ne: null }
          } 
        },
        {
          $group: {
            _id: "$assignedTo",
            count: { $sum: 1 }
          }
        }
      ]),
      // 4. Productivity counts
      Task.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
            completedThisWeek: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$status", "COMPLETED"] },
                      { $gte: ["$updatedAt", sevenDaysAgo] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    // Format Task Trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const trend = taskTrendStats.find(s => s._id === dateStr);
      return {
        name: format(date, "MMM dd"),
        completed: trend?.count || 0,
      };
    }).reverse();

    // Format Project Distribution
    const statsMap = new Map(projectStats.map(s => [s._id?.toString(), s]));
    const derivedProjects = projects.map(p => {
      const stats = statsMap.get(p._id.toString()) || { total: 0, completed: 0, inProgress: 0, todo: 0 };
      return { ...p, status: getProjectDerivedStatus(stats) };
    });

    const projectDistribution = [
      { name: "To Do", value: derivedProjects.filter(p => p.status === "TODO").length },
      { name: "In Progress", value: derivedProjects.filter(p => p.status === "IN_PROGRESS").length },
      { name: "Completed", value: derivedProjects.filter(p => p.status === "COMPLETED").length },
    ];

    // Format Workload Data
    const workloadMap = new Map(workloadStats.map(s => [s._id.toString(), s.count]));
    const workloadData = members.map((member: any) => ({
      name: member.userId.name,
      image: member.userId.image,
      tasks: workloadMap.get(member.userId._id.toString()) || 0
    }));

    // Format Productivity Metrics
    const pStats = productivityStats[0] || { total: 0, completed: 0, completedThisWeek: 0 };
    const completionRate = pStats.total > 0 ? Math.round((pStats.completed / pStats.total) * 100) : 0;

    return { 
      taskTrends: last7Days, 
      projectDistribution, 
      workloadData, 
      productivity: {
        completionRate,
        tasksCompletedThisWeek: pStats.completedThisWeek,
        totalTasks: pStats.total
      }
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
