import { auth } from "@/auth";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import WorkspaceMember from "@/models/WorkspaceMember";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await connectDB();
  const membership = await WorkspaceMember.findOne({ userId: session.user.id });
  
  const userData = {
    ...session.user,
    workspaceRole: membership?.role || "MEMBER",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="grid gap-8">
        <ProfileSettingsForm user={userData} />
        <PasswordSettingsForm />
      </div>
    </div>
  );
}
