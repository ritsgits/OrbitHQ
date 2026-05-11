import { getProjects } from "@/actions/project-actions"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import { Orbit } from "lucide-react"

export default async function ProjectsPage() {
  const { data: projects, error } = await getProjects();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your workspace projects and track their progress.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Orbit className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No projects found</h3>
          <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
          <CreateProjectDialog />
        </div>
      )}
    </div>
  )
}
