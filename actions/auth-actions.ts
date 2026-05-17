  "use server"

  import { signIn, signOut } from "@/auth";
  import connectDB from "@/lib/db";
  import User from "@/models/User";
  import Workspace from "@/models/Workspace";
  import WorkspaceMember from "@/models/WorkspaceMember";
  import bcrypt from "bcryptjs";
  import { AuthError } from "next-auth";
  import { z } from "zod";

  const SignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  });

  const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

export async function signUpAction(formData: z.infer<typeof SignupSchema>) {
  try {
    await connectDB();
    
    const { name, email, password, workspaceName } = formData;
    
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }
    
    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 3. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // 4. Create Workspace
    const slug = workspaceName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const workspace = await Workspace.create({
      name: workspaceName,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`, // Ensure unique slug
    });
    
    // 5. Create WorkspaceMember (OWNER)
    await WorkspaceMember.create({
      userId: user._id,
      workspaceId: workspace._id,
      role: "OWNER",
    });

    // 6. Automatically sign in (Inside try/catch to gracefully handle errors since redirect is false)
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Signup error:", error);
    if (error instanceof AuthError) {
      return { error: "Account created, but failed to automatically sign in. Please log in manually." };
    }
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginAction(formData: z.infer<typeof LoginSchema>) {
  try {
    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (result && typeof result === "object" && "error" in result && result.error) {
      return { error: "Invalid credentials." };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Login AuthError:", error.type, error.message);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Invalid credentials." };
      }
    }
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

  export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
  }
