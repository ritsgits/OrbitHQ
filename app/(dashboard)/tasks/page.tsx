import { getTasks } from "@/actions/task-actions"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"

export default async function TasksPage() {
  const { data: tasks, error } = await getTasks();

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            View and manage your tasks across all projects.
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1">
        <KanbanBoard tasks={tasks || []} />
      </div>
    </div>
  )
}
