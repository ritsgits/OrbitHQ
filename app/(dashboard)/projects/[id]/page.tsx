import { getProjectById } from "@/actions/project-actions"
import { getTasks } from "@/actions/task-actions"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [projectRes, tasksRes] = await Promise.all([
    getProjectById(params.id),
    getTasks(params.id)
  ]);

  if (!projectRes.data) {
    notFound();
  }

  const project = projectRes.data;
  const tasks = tasksRes.data || [];

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {project.description || "No description provided for this project."}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
              <span className="text-muted-foreground font-medium">Status:</span>
              <Badge variant="outline">{project.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
              <span className="text-muted-foreground font-medium">Priority:</span>
              <Badge variant="outline">{project.priority}</Badge>
            </div>
            {project.dueDate && (
              <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{format(new Date(project.dueDate), "PPP")}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 min-w-[200px]">
          <CreateTaskDialog initialProjectId={project.id} />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Project Tasks</h2>
        </div>
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  )
}
