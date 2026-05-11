"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import WorkspaceMember from "@/models/WorkspaceMember";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/activity";

const ProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
});

async function checkProjectPermissions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectDB();
  const membership = await WorkspaceMember.findOne({ userId: session.user.id });
  if (!membership) throw new Error("No workspace membership found");

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";
  
  return { 
    userId: session.user.id, 
    workspaceId: membership.workspaceId,
    canManage 
  };
}

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

    return { success: true, data: JSON.parse(JSON.stringify(project)) };
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

    return { success: true, data: JSON.parse(JSON.stringify(project)) };
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

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete project" };
  }
}

export async function getProjects() {
  try {
    const { workspaceId } = await checkProjectPermissions();
    const projects = await Project.find({ workspaceId }).sort({ createdAt: -1 });
    return { data: JSON.parse(JSON.stringify(projects)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch projects" };
  }
}

export async function getProjectById(id: string) {
  try {
    const { workspaceId } = await checkProjectPermissions();
    const project = await Project.findOne({ _id: id, workspaceId });
    return { data: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch project" };
  }
}
