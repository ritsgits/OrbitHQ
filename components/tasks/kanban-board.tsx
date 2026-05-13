"use client"

import { Task } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User as UserIcon, Calendar } from "lucide-react"
import { format } from "date-fns"
import { updateTaskStatus } from "@/actions/task-actions"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
] as const;

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const { data: session } = useSession();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const filteredTasks = showMyTasks 
    ? localTasks.filter(t => (t.assignedTo as any)?._id === session?.user?.id)
    : localTasks;

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    // Optimistic update
    const updatedTasks = localTasks.map(t => 
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    setLocalTasks(updatedTasks);

    const result = await updateTaskStatus(taskId, newStatus);
    if (result.error) {
      setLocalTasks(tasks);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else {
      toast({
        variant: "success",
        title: "Success",
        description: result.success,
      })
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-end px-2">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
          <button 
            onClick={() => setShowMyTasks(false)}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
              !showMyTasks ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Tasks
          </button>
          <button 
            onClick={() => setShowMyTasks(true)}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
              showMyTasks ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Tasks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col bg-muted/20 rounded-2xl p-4 border border-border/50 shadow-inner group/col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 group-hover/col:text-primary transition-colors">
                  {column.label}
                </h3>
                <Badge variant="outline" className="bg-background/50 border-border/50 font-black text-[10px]">
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    currentUserId={session?.user?.id}
                    onStatusChange={handleStatusChange} 
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-2xl opacity-40">
                    <p className="text-[10px] font-bold uppercase tracking-widest">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, currentUserId, onStatusChange }: { task: Task, currentUserId?: string, onStatusChange: (id: string, s: any) => void }) {
  const isAssignedToMe = (task.assignedTo as any)?._id === currentUserId;
  const assignee = task.assignedTo as any;

  const priorityColor = {
    LOW: "bg-blue-500",
    MEDIUM: "bg-amber-500",
    HIGH: "bg-rose-500",
  }[task.priority];

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing border-muted-foreground/10 bg-card/80 backdrop-blur-sm hover:border-primary/50 overflow-hidden relative">
      <div className={cn("absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5", priorityColor)} />
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={cn("rounded-md font-bold text-[9px] uppercase tracking-wider px-1.5 py-0 border-border/50", 
            task.priority === "HIGH" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : 
            task.priority === "MEDIUM" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : 
            "text-blue-500 border-blue-500/20 bg-blue-500/5"
          )}>
            {task.priority}
          </Badge>
          {isAssignedToMe && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 rounded-full">
              Assigned to You
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-4">
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-2 group/assignee">
                <Avatar className="h-6 w-6 border border-border/50">
                  <AvatarImage src={assignee.image} />
                  <AvatarFallback className="text-[10px] font-bold bg-muted">
                    {assignee.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold text-muted-foreground group-hover/assignee:text-foreground transition-colors">
                  {assignee.name?.split(" ")[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground italic font-medium">
                <UserIcon className="h-3 w-3" />
                Unassigned
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
              <Calendar className="h-3 w-3" />
              {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "None"}
            </div>
            
            <select 
              value={task.status} 
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="text-[9px] font-black uppercase tracking-widest bg-muted/50 border border-border/50 rounded-lg px-2 py-1 focus:ring-0 cursor-pointer hover:bg-muted transition-all appearance-none"
            >
              {COLUMNS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
