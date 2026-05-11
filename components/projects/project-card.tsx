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

export function ProjectCard({ project }: { project: Project }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusVariant = {
    TODO: "secondary",
    IN_PROGRESS: "info",
    COMPLETED: "success",
  }[project.status] as any;

  const priorityVariant = {
    LOW: "secondary",
    MEDIUM: "warning",
    HIGH: "destructive",
  }[project.priority] as any;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this project? All associated tasks will remain but orphaned.")) return;
    
    setIsDeleting(true);
    await deleteProject(project._id);
    setIsDeleting(false);
  };

  return (
    <Link href={`/projects/${project._id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 group border-muted-foreground/10 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant={statusVariant}>{project.status.replace("_", " ")}</Badge>
            <Badge variant={priorityVariant}>{project.priority}</Badge>
          </div>
          <CardTitle className="mt-2 line-clamp-1 group-hover:text-primary transition-colors">
            {project.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "No due date"}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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
