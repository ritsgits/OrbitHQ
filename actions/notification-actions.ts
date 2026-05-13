"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import WorkspaceMember from "@/models/WorkspaceMember";
import Task from "@/models/Task";
import User from "@/models/User"; // Ensure User model is loaded for population

export async function getRecentActivityAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await connectDB();
    
    // 1. Get user's primary workspace
    const membership = await WorkspaceMember.findOne({ userId: session.user.id });
    if (!membership) return { activities: [] };

    // 2. Fetch latest 5 activities
    const activities = await ActivityLog.find({ workspaceId: membership.workspaceId })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate("userId", "name email image")
      .lean();

    return { activities: JSON.parse(JSON.stringify(activities)) };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { error: "Failed to load notifications" };
  }
}

export async function getProjectActivityAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await connectDB();
    
    // Fetch latest 5 activities for this project
    // Note: ActivityLog should have entityId or metadata that links to the project
    // For now, we'll filter by entityId if entityType is PROJECT or by metadata.projectId
    const activities = await ActivityLog.find({ 
      $or: [
        { entityId: projectId, entityType: "PROJECT" },
        { "metadata.projectId": projectId },
      ]
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate("userId", "name email image")
      .lean();

    return { activities: JSON.parse(JSON.stringify(activities)) };
  } catch (error) {
    console.error("Failed to fetch project activity:", error);
    return { error: "Failed to load activity" };
  }
}
