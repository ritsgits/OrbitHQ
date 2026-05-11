import mongoose, { Schema, model, models } from "mongoose";

const LeadSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["NEW", "CONTACTED", "NEGOTIATION", "WON", "LOST"],
    default: "NEW",
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

LeadSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Lead = models.Lead || model("Lead", LeadSchema);

export default Lead;
