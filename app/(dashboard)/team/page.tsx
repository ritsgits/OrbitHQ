import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Mail, Shield, User } from "lucide-react"
import { getWorkspaceMembers } from "@/actions/member-actions"
import { InviteMemberDialog } from "@/components/team/invite-member-dialog"
import { Badge } from "@/components/ui/badge"

export default async function TeamPage() {
  const { data: members, error } = await getWorkspaceMembers();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage your workspace members and their roles.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined At</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {members?.map((member: any) => (
                <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {member.userId?.name?.[0] || <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{member.userId?.name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{member.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {member.role === "OWNER" && <Shield className="h-3 w-3 text-amber-500" />}
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!members?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

