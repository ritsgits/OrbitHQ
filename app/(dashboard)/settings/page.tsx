import { auth } from "@/auth";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import WorkspaceMember from "@/models/WorkspaceMember";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import mongoose from "mongoose";
import { resolveUserId } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userIdStr = await resolveUserId(session);
  if (!userIdStr) {
    redirect("/login");
  }

  await connectDB();
  const membership = await WorkspaceMember.findOne({ 
    userId: new mongoose.Types.ObjectId(userIdStr) 
  });
  
  const userData = {
    ...session.user,
    workspaceRole: membership?.role || "MEMBER",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and workspace configuration.
        </p>
      </div>

      <div className="grid gap-6">
        <ProfileSettingsForm user={userData} />

        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Configure your workspace name and slug.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="OrbitHQ Main" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Workspace Slug</label>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">orbithq.com/</span>
                <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="main" />
              </div>
            </div>
            <Button>Update Workspace</Button>
          </CardContent>
        </Card>

        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader>
            <CardTitle className="text-rose-600 dark:text-rose-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Workspace</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
