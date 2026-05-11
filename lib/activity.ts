import connectDB from "./db";
import ActivityLog from "@/models/ActivityLog";

interface LogActivityProps {
  workspaceId: string;
  userId: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE" | "INVITE" | "JOIN";
  entityType: "PROJECT" | "TASK" | "MEMBER" | "WORKSPACE" | "LEAD";
  entityId: string;
  metadata?: any;
}

export async function logActivity({
  workspaceId,
  userId,
  actionType,
  entityType,
  entityId,
  metadata = {},
}: LogActivityProps) {
  try {
    await connectDB();
    await ActivityLog.create({
      workspaceId,
      userId,
      actionType,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to avoid breaking the main operation
  }
}
