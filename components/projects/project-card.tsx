"use client"

import { Project } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MoreVertical, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { deleteProject } from "@/actions/project-actions"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getProjectProgress } from "@/utils/project-helpers"

export function ProjectCard({ project }: { project: any }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusVariant = {
    TODO: "secondary",
    IN_PROGRESS: "info",
    COMPLETED: "success",
  }[project.status as string] as any;

  const priorityVariant = {
    LOW: "secondary",
    MEDIUM: "warning",
    HIGH: "destructive",
  }[project.priority as string] as any;

  const stats = project.taskStats || { total: 0, completed: 0, todo: 0, inProgress: 0, overdue: 0 };
  const progress = getProjectProgress(stats);

  // Health logic: AT_RISK if any overdue tasks, COMPLETED if 100%, ON_TRACK if > 70% and no overdue, else IN_PROGRESS
  let health: "COMPLETED" | "ON_TRACK" | "AT_RISK" | "IN_PROGRESS" = "IN_PROGRESS";
  if (stats.total > 0 && stats.completed === stats.total) health = "COMPLETED";
  else if (stats.overdue > 0) health = "AT_RISK";
  else if (progress >= 70) health = "ON_TRACK";

  const healthStyles = {
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ON_TRACK: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    AT_RISK: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    IN_PROGRESS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }[health];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this project? All associated tasks will remain but orphaned.")) return;
    
    setIsDeleting(true);
    await deleteProject(project._id);
    setIsDeleting(false);
  };

  return (
    <Link href={`/projects/${project._id}`}>
      <Card className="hover:shadow-2xl transition-all duration-300 group border-muted-foreground/10 h-full flex flex-col bg-card/50 backdrop-blur-sm hover:border-primary/50 overflow-hidden relative">
        <div className={cn("absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5", 
          health === "AT_RISK" ? "bg-rose-500" : progress === 100 ? "bg-emerald-500" : "bg-primary"
        )} />
        
        <CardHeader className="pb-3 pt-5">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <Badge variant={statusVariant} className="rounded-md font-bold text-[10px] uppercase tracking-wider px-2 py-0">
                {project.status.replace("_", " ")}
              </Badge>
              <div className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", healthStyles)}>
                {health.replace("_", " ")}
              </div>
            </div>
            <Badge variant={priorityVariant} className="rounded-md font-bold text-[10px] uppercase tracking-wider px-2 py-0">
              {project.priority}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {project.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-4 flex-grow space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description || "No description provided."}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-muted-foreground">PROGRESS</span>
              <span className="text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000 ease-out", 
                  progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-primary" : "bg-amber-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>{stats.completed}/{stats.total} tasks completed</span>
              {stats.overdue > 0 && <span className="text-rose-500 font-bold">{stats.overdue} overdue</span>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "No due date"}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
