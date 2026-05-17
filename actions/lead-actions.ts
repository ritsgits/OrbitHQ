"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import WorkspaceMember from "@/models/WorkspaceMember";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import mongoose from "mongoose";
import { resolveUserId } from "@/lib/auth";

const LeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone is required"),
  status: z.enum(["NEW", "CONTACTED", "NEGOTIATION", "WON", "LOST"]).default("NEW"),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional(),
});

async function checkLeadPermissions() {
  const session = await auth();
  const userIdStr = await resolveUserId(session);
  if (!userIdStr) throw new Error("Unauthorized");

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId(userIdStr) 
  });
  if (!membership) throw new Error("No workspace membership found");

  return { 
    userId: userIdStr, 
    workspaceId: membership.workspaceId,
    role: membership.role
  };
}

export async function createLead(data: z.infer<typeof LeadSchema>) {
  try {
    const { userId, workspaceId, role } = await checkLeadPermissions();
    if (role === "MEMBER") return { error: "Members cannot create leads" };

    const lead = await Lead.create({
      ...data,
      workspaceId,
    });

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "CREATE",
      entityType: "LEAD",
      entityId: lead._id.toString(),
      metadata: { name: lead.name, company: lead.company }
    });

    revalidatePath("/crm");
    return { success: "Lead created successfully", data: JSON.parse(JSON.stringify(lead)) };
  } catch (error: any) {
    return { error: error.message || "Failed to create lead" };
  }
}

export async function getLeads() {
  try {
    const { workspaceId } = await checkLeadPermissions();
    const leads = await Lead.find({ workspaceId }).sort({ createdAt: -1 }).populate("assignedTo", "name email");
    return { data: JSON.parse(JSON.stringify(leads)) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch leads" };
  }
}

export async function deleteLead(id: string) {
  try {
    const { workspaceId, role } = await checkLeadPermissions();
    if (role === "MEMBER") return { error: "Only admins and owners can delete leads" };

    const lead = await Lead.findOneAndDelete({ _id: id, workspaceId });
    if (!lead) return { error: "Lead not found" };

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId: (await auth())?.user?.id as string,
      actionType: "DELETE",
      entityType: "LEAD",
      entityId: id,
      metadata: { name: lead.name }
    });

    revalidatePath("/crm");
    return { success: "Lead deleted successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete lead" };
  }
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    const { userId, workspaceId, role } = await checkLeadPermissions();
    if (role === "MEMBER") return { error: "Members cannot update lead status" };

    const lead = await Lead.findOneAndUpdate(
      { _id: id, workspaceId },
      { status },
      { new: true }
    );
    if (!lead) return { error: "Lead not found" };

    await logActivity({
      workspaceId: workspaceId.toString(),
      userId,
      actionType: "STATUS_CHANGE",
      entityType: "LEAD",
      entityId: id,
      metadata: { name: lead.name, status }
    });

    revalidatePath("/crm");
    return { success: "Status updated successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead status" };
  }
}
