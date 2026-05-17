"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import User from "@/models/User";
import { logActivity } from "@/lib/activity";
import mongoose from "mongoose";

import { revalidatePath } from "next/cache";

export async function getWorkspaceMembers() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();
    const currentMember = await WorkspaceMember.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    });
    if (!currentMember) throw new Error("No workspace membership found");

    const members = await WorkspaceMember.find({ 
      workspaceId: currentMember.workspaceId 
    }).populate('userId', 'name email image');
    
    return { data: JSON.parse(JSON.stringify(members)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch members" };
  }
}

export async function inviteMember(email: string, role: "ADMIN" | "MEMBER") {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();
    const currentMember = await WorkspaceMember.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    });
    if (!currentMember) throw new Error("No workspace membership found");

    if (currentMember.role === "MEMBER") {
      return { error: "Only admins and owners can invite members" };
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return { error: "User not found with this email" };
    }

    const existingMembership = await WorkspaceMember.findOne({
      userId: userToInvite._id,
      workspaceId: currentMember.workspaceId
    });

    if (existingMembership) {
      return { error: "User is already a member of this workspace" };
    }

    await WorkspaceMember.create({
      userId: userToInvite._id,
      workspaceId: currentMember.workspaceId,
      role
    });

    await logActivity({
      workspaceId: currentMember.workspaceId.toString(),
      userId: session.user.id as string,
      actionType: "INVITE",
      entityType: "MEMBER",
      entityId: userToInvite._id.toString(),
      metadata: { email, role }
    });

    revalidatePath("/team");
    return { success: "Member invited successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to invite member" };
  }
}

