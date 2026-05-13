"use server"

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function updateProfileAction(data: z.infer<typeof ProfileSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const { name } = data;
    
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id, 
      { name },
      { new: true }
    );

    if (!updatedUser) {
      return { error: "User not found" };
    }

    // Revalidate all related paths to ensure UI is fresh
    revalidatePath("/settings/profile");
    revalidatePath("/(dashboard)/settings/profile", "page");
    revalidatePath("/dashboard");
    revalidatePath("/");
    
    return { 
      success: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email
      }
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

export async function updatePasswordAction(formData: z.infer<typeof PasswordSchema>) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const { currentPassword, newPassword } = formData;

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user || !user.password) return { error: "User not found" };

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) return { error: "Incorrect current password" };

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(session.user.id, { password: hashedNewPassword });

    return { success: "Password updated successfully" };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Failed to update password" };
  }
}
