"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import mongoose from "mongoose";

const TaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  projectId: z.string().min(1, "Project is required"),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

import { cache } from "react";

const checkTaskPermissions = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId(session.user.id) 
  }).lean();
  if (!membership) throw new Error("No workspace membership found");

  return { 
    userId: session.user.id, 
    workspaceId: (membership.workspaceId as any).toString(),
    role: membership.role
  };
});

export async function createTask(data: z.infer<typeof TaskSchema>) {
  try {
    const { userId, workspaceId, role } = await checkTaskPermissions();
    if (role === "MEMBER") return { error: "Members cannot create tasks" };

    const task = await Task.create({
      ...data,
      workspaceId,
      createdBy: userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.projectId}`);

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "CREATE",
      entityType: "TASK",
      entityId: task._id.toString(),
      metadata: { title: task.title, projectId: task.projectId.toString() }
    });

    return { success: "Task created successfully", data: JSON.parse(JSON.stringify(task)) };
  } catch (error: any) {
    return { error: error.message || "Failed to create task" };
  }
}

export async function updateTask(id: string, data: Partial<z.infer<typeof TaskSchema>>) {
  try {
    const { userId, workspaceId, role } = await checkTaskPermissions();
    
    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) return { error: "Task not found" };

    // Permissions: Admin/Owner can edit anything. Member can only edit assigned tasks.
    const isOwner = role === "OWNER" || role === "ADMIN";
    const isAssigned = task.assignedTo?.toString() === userId;

    if (!isOwner && !isAssigned) {
      return { error: "You don't have permission to edit this task" };
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, workspaceId },
      { 
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      { new: true }
    );

    if (!updatedTask) return { error: "Task not found" };

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${task.projectId}`);

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "UPDATE",
      entityType: "TASK",
      entityId: id,
      metadata: { title: updatedTask.title, projectId: updatedTask.projectId.toString() }
    });

    return { success: "Task updated successfully", data: JSON.parse(JSON.stringify(updatedTask)) };
  } catch (error: any) {
    return { error: error.message || "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  try {
    const { workspaceId, role } = await checkTaskPermissions();
    if (role === "MEMBER") return { error: "Members cannot delete tasks" };

    const task = await Task.findOneAndDelete({ _id: id, workspaceId });
    if (!task) return { error: "Task not found" };

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${task.projectId}`);

    const session = await auth();
    await logActivity({
      workspaceId: workspaceId.toString(),
      userId: session?.user?.id as string,
      actionType: "DELETE",
      entityType: "TASK",
      entityId: id,
      metadata: { title: task.title }
    });

    return { success: "Task deleted successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete task" };
  }
}

export async function getTasks(projectId?: string) {
  try {
    const { workspaceId } = await checkTaskPermissions();
    const query: any = { workspaceId };
    if (projectId) query.projectId = projectId;
    
    const tasks = await Task.find(query).sort({ createdAt: -1 }).populate("assignedTo", "name email image").lean();
    return { data: JSON.parse(JSON.stringify(tasks)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch tasks" };
  }
}

export async function updateTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") {
  try {
    const { userId, workspaceId, role } = await checkTaskPermissions();
    
    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) return { error: "Task not found" };

    const isOwner = role === "OWNER" || role === "ADMIN";
    const isAssigned = task.assignedTo?.toString() === userId;

    if (!isOwner && !isAssigned) {
      return { error: "You don't have permission to update this task" };
    }

    task.status = status;
    await task.save();

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${task.projectId}`);

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "STATUS_CHANGE",
      entityType: "TASK",
      entityId: id,
      metadata: { title: task.title, status, projectId: task.projectId.toString() }
    });

    return { success: "Status updated successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to update task status" };
  }
}
