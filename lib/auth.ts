import { auth } from "@/auth";
import connectDB from "./db";
import WorkspaceMember from "@/models/WorkspaceMember";
import Workspace from "@/models/Workspace";
import User from "@/models/User";
import mongoose from "mongoose";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Resolves the authenticated user ID based on priority:
 * 1. session.user.id
 * 2. token.sub (session.user.sub)
 * 3. email lookup fallback (ONLY if both are missing to avoid redundant DB queries)
 */
export async function resolveUserId(session: any) {
  if (!session?.user) return null;
  
  // Priority 1: session.user.id (mapped to token.id || token.sub)
  if (session.user.id) return session.user.id;
  
  // Priority 2: token.sub check
  if ((session.user as any).sub) return (session.user as any).sub;
  if ((session as any).sub) return (session as any).sub;

  // Priority 3: Email lookup fallback ONLY if both are missing
  if (session.user.email) {
    await connectDB();
    const userDoc = await User.findOne({ email: session.user.email }).lean();
    return userDoc ? userDoc._id.toString() : null;
  }

  return null;
}

/**
 * Gets the active workspace for the current user.
 * Resolves the first workspace membership found for the user.
 */
export async function getActiveWorkspace() {
  const session = await getSession();
  const userIdStr = await resolveUserId(session);
  if (!userIdStr) return null;

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId(userIdStr) 
  }).populate('workspaceId');
  
  if (!membership) return null;
  
  return membership.workspaceId as any;
}

/**
 * Verifies if the user has access to a specific workspace.
 */
export async function verifyWorkspaceAccess(workspaceId: string) {
  const session = await getSession();
  const userIdStr = await resolveUserId(session);
  if (!userIdStr) return false;

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId(userIdStr), 
    workspaceId 
  });
  
  return !!membership;
}
