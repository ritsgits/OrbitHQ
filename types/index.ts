export type UserRole = "ADMIN" | "USER";
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type ProjectStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  role: UserRole;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
}

export interface WorkspaceMember {
  _id: string;
  userId: any; // Populated User or ID string
  workspaceId: string;
  role: MemberRole;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdBy: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  workspaceId: string;
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
