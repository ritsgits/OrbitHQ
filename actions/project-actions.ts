"use server"
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getProjectDerivedStatus } from "@/utils/project-helpers";

const ProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
});

import { cache } from "react";

const checkProjectPermissions = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectDB();
  const membership = await WorkspaceMember.findOne({ userId: session.user.id }).lean();
  if (!membership) throw new Error("No workspace membership found");

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";
  
  return { 
    userId: session.user.id, 
    workspaceId: (membership.workspaceId as any).toString(),
    canManage 
  };
});

export async function createProject(data: z.infer<typeof ProjectSchema>) {
  try {
    const { userId, workspaceId, canManage } = await checkProjectPermissions();
    if (!canManage) return { error: "Only admins and owners can create projects" };

    const project = await Project.create({
      ...data,
      workspaceId,
      createdBy: userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "CREATE",
      entityType: "PROJECT",
      entityId: project._id.toString(),
      metadata: { name: project.name }
    });

    return { success: "Project created successfully", data: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { error: error.message || "Failed to create project" };
  }
}

export async function updateProject(id: string, data: Partial<z.infer<typeof ProjectSchema>>) {
  try {
    const { workspaceId, canManage } = await checkProjectPermissions();
    if (!canManage) return { error: "Only admins and owners can edit projects" };

    const project = await Project.findOneAndUpdate(
      { _id: id, workspaceId },
      { 
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      { new: true }
    );

    if (!project) return { error: "Project not found" };

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${id}`);

    const session = await auth();
    await logActivity({
      workspaceId: workspaceId.toString(),
      userId: session?.user?.id as string,
      actionType: "UPDATE",
      entityType: "PROJECT",
      entityId: id,
      metadata: { name: project.name }
    });

    return { success: "Project updated successfully", data: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    return { error: error.message || "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
  try {
    const { workspaceId, canManage } = await checkProjectPermissions();
    if (!canManage) return { error: "Only admins and owners can delete projects" };

    const project = await Project.findOneAndDelete({ _id: id, workspaceId });
    if (!project) return { error: "Project not found" };

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    const session = await auth();
    await logActivity({
      workspaceId: workspaceId.toString(),
      userId: session?.user?.id as string,
      actionType: "DELETE",
      entityType: "PROJECT",
      entityId: id,
      metadata: { name: project.name }
    });

    return { success: "Project deleted successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete project" };
  }
}

export async function getProjects() {
  try {
    const { workspaceId } = await checkProjectPermissions();
    const projects = await Project.find({ workspaceId }).sort({ createdAt: -1 }).lean();
    
    // Optimize: Single aggregation for all projects in the workspace
    const allTaskStats = await Task.aggregate([
      { $match: { workspaceId } },
      {
        $group: {
          _id: "$projectId",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          todo: {
            $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $lt: ["$dueDate", new Date()] },
                    { $ne: ["$status", "COMPLETED"] }
                  ]
                }, 
                1, 
                0
              ]
            }
          }
        }
      }
    ]);

    const statsMap = new Map(allTaskStats.map(s => [s._id.toString(), s]));
    
    const projectsWithStats = projects.map((project) => {
      const stats = statsMap.get(project._id.toString()) || { total: 0, completed: 0, todo: 0, inProgress: 0, overdue: 0 };
      
      return {
        ...project,
        _id: project._id.toString(),
        status: getProjectDerivedStatus(stats),
        taskStats: stats
      };
    });

    return { data: JSON.parse(JSON.stringify(projectsWithStats)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch projects" };
  }
}

export async function getProjectById(id: string) {
  try {
    const { workspaceId } = await checkProjectPermissions();
    const projectId = new mongoose.Types.ObjectId(id);

    const [project, taskStats] = await Promise.all([
      Project.findOne({ _id: projectId, workspaceId }).lean(),
      Task.aggregate([
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
            },
            todo: {
              $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $lt: ["$dueDate", new Date()] },
                      { $ne: ["$status", "COMPLETED"] }
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

    if (!project) return { error: "Project not found" };

    const stats = taskStats[0] || { total: 0, completed: 0, todo: 0, inProgress: 0, overdue: 0 };

    return { 
      data: JSON.parse(JSON.stringify({
        ...project,
        _id: project._id.toString(),
        status: getProjectDerivedStatus(stats),
        taskStats: stats
      })) 
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch project" };
  }
}
