import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkspaceMember extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    role: { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER'], default: 'MEMBER' },
  },
  { timestamps: true }
);

// Ensure unique member per workspace
WorkspaceMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

const WorkspaceMember: Model<IWorkspaceMember> = 
  mongoose.models.WorkspaceMember || mongoose.model<IWorkspaceMember>('WorkspaceMember', WorkspaceMemberSchema);

export default WorkspaceMember;
