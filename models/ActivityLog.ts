import mongoose, { Schema, model, models } from "mongoose";

const ActivityLogSchema = new Schema({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "INVITE", "JOIN"],
  },
  entityType: {
    type: String,
    required: true,
    enum: ["PROJECT", "TASK", "MEMBER", "WORKSPACE", "LEAD"],
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ActivityLog = models.ActivityLog || model("ActivityLog", ActivityLogSchema);

export default ActivityLog;
