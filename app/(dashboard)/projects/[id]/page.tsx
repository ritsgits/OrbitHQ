import { getProjectById } from "@/actions/project-actions"
import { getTasks } from "@/actions/task-actions"
import { getProjectActivityAction } from "@/actions/notification-actions"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Briefcase, Users, Activity, CheckCircle2, AlertCircle, Clock, Layout } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import { getProjectProgress } from "@/utils/project-helpers"

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const [projectRes, tasksRes, activityRes] = await Promise.all([
    getProjectById(id),
    getTasks(id),
    getProjectActivityAction(id)
  ]);

  if (!projectRes.data) {
    notFound();
  }

  const project = projectRes.data;
  const tasks = tasksRes.data || [];
  const activities = activityRes.activities || [];
  const stats = project.taskStats || { total: 0, completed: 0, todo: 0, inProgress: 0, overdue: 0 };
  const progress = getProjectProgress(stats);

  // Health logic
  let health: "COMPLETED" | "ON_TRACK" | "AT_RISK" | "IN_PROGRESS" = "IN_PROGRESS";
  if (stats.total > 0 && stats.completed === stats.total) health = "COMPLETED";
  else if (stats.overdue > 0) health = "AT_RISK";
  else if (progress >= 70) health = "ON_TRACK";

  const healthConfig = {
    COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    ON_TRACK: { label: "On Track", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    AT_RISK: { label: "At Risk", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  }[health];

  const HealthIcon = healthConfig.icon;

  // Extract unique assigned users
  const assignedMembers = tasks
    .map((t: any) => t.assignedTo)
    .filter((u: any, index: number, self: any[]) => u && self.findIndex(s => s?._id === u?._id) === index);

  return (
    <div className="space-y-8 flex flex-col h-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-8 bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-muted-foreground/10 shadow-sm relative overflow-hidden">
        <div className={cn("absolute top-0 left-0 w-full h-1.5", health === "AT_RISK" ? "bg-rose-500" : progress === 100 ? "bg-emerald-500" : "bg-primary")} />
        
        <div className="space-y-6 max-w-3xl flex-1">
          <div className="flex items-center gap-4">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", healthConfig.bg, healthConfig.color)}>
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tight">{project.name}</h1>
                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", healthConfig.bg, healthConfig.color, healthConfig.border)}>
                  <HealthIcon className="h-3.5 w-3.5" />
                  {healthConfig.label}
                </div>
              </div>
              <p className="text-lg text-muted-foreground font-medium max-w-xl">
                {project.description || "Project execution and tracking dashboard."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-muted rounded-lg"><Layout className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Status</p>
                <p className="font-bold">{project.status.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-muted rounded-lg"><AlertCircle className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Priority</p>
                <p className="font-bold">{project.priority}</p>
              </div>
            </div>
            {project.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-muted rounded-lg"><Calendar className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Deadline</p>
                  <p className="font-bold">{format(new Date(project.dueDate), "PPP")}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-muted rounded-lg"><Users className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Team</p>
                <p className="font-bold">{assignedMembers.length} Members</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-80 space-y-6">
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Completion</h3>
              <span className="text-2xl font-black">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-muted" />
            <p className="mt-3 text-xs text-muted-foreground font-medium text-center">
              {stats.completed} of {stats.total} tasks finished
            </p>
          </div>
          <CreateTaskDialog initialProjectId={project._id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content - Kanban */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="h-6 w-6 text-primary" />
              Task Board
            </h2>
            <div className="flex gap-4">
              <Badge variant="outline" className="bg-muted/50 border-border/50 font-bold">{stats.todo} TODO</Badge>
              <Badge variant="outline" className="bg-muted/50 border-border/50 font-bold text-blue-500">{stats.inProgress} ACTIVE</Badge>
              <Badge variant="outline" className="bg-muted/50 border-border/50 font-bold text-emerald-500">{stats.completed} DONE</Badge>
            </div>
          </div>
          <KanbanBoard tasks={tasks} />
        </div>

        {/* Sidebar - Insights */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-muted-foreground/10 shadow-sm overflow-hidden bg-card/30">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Active Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {assignedMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assignedMembers.map((member: any) => (
                    <div key={member._id} className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary group relative cursor-pointer" title={member.name}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No members assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-muted-foreground/10 shadow-sm overflow-hidden bg-card/30">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {activities.map((activity: any, index: number) => (
                  <div key={activity._id} className={cn("p-4 flex gap-3 items-start", index !== activities.length - 1 && "border-b border-border/50")}>
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] leading-tight">
                        <span className="font-bold">{activity.userId?.name}</span>
                        {" "}
                        <span className="text-muted-foreground">{activity.actionType.toLowerCase()}d</span>
                        {" "}
                        <span className="font-semibold text-primary/80 truncate block">{activity.metadata?.title || activity.entityType}</span>
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1">
                        {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
