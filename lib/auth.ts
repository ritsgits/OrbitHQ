import { auth } from "@/auth";
import connectDB from "./db";
import WorkspaceMember from "@/models/WorkspaceMember";
import Workspace from "@/models/Workspace";
import mongoose from "mongoose";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Gets the active workspace for the current user.
 * In a real app, this might be stored in a cookie or session.
 * For now, we'll fetch the first workspace they are a member of.
 */
export async function getActiveWorkspace() {
  const user = await getCurrentUser();
  if (!user || !(user as any).id) return null;

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId((user as any).id) 
  }).populate('workspaceId');
  
  if (!membership) return null;
  
  return membership.workspaceId as any;
}

/**
 * Verifies if the user has access to a specific workspace.
 */
export async function verifyWorkspaceAccess(workspaceId: string) {
  const user = await getCurrentUser();
  if (!user || !(user as any).id) return false;

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId((user as any).id), 
    workspaceId 
  });
  
  return !!membership;
}
