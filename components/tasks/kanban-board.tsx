"use client"

import { Task } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User as UserIcon, Calendar } from "lucide-react"
import { format } from "date-fns"
import { updateTaskStatus } from "@/actions/task-actions"
import { useState, useEffect } from "react"

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
] as const;

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    // Optimistic update
    const updatedTasks = localTasks.map(t => 
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    setLocalTasks(updatedTasks);

    const result = await updateTaskStatus(taskId, newStatus);
    if (result.error) {
      // Revert if error
      setLocalTasks(tasks);
      alert(result.error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
      {COLUMNS.map((column) => {
        const columnTasks = localTasks.filter((t) => t.status === column.id);
        
        return (
          <div key={column.id} className="flex flex-col bg-muted/30 rounded-xl p-4 border border-muted-foreground/10">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {column.label}
              </h3>
              <Badge variant="secondary" className="bg-background">
                {columnTasks.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
              {columnTasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg opacity-50">
                  <p className="text-xs italic">No tasks here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: Task, onStatusChange: (id: string, s: any) => void }) {
  const priorityColor = {
    LOW: "bg-blue-500",
    MEDIUM: "bg-amber-500",
    HIGH: "bg-rose-500",
  }[task.priority];

  return (
    <Card className="group hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-muted-foreground/5 bg-card overflow-hidden">
      <div className={`h-1 w-full ${priorityColor}`} />
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-bold leading-tight line-clamp-2">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}
          </div>
          
          <select 
            value={task.status} 
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-[10px] bg-muted/50 border-none rounded px-1 py-0.5 focus:ring-0 cursor-pointer"
          >
            {COLUMNS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
