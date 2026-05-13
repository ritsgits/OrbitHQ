import { Skeleton } from "@/components/ui/skeleton" // Fixed import
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ProjectsLoading() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-muted-foreground/10 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-[280px] border-muted-foreground/10 bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-muted" />
            <CardHeader className="pb-3 pt-5">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="pt-3 pb-4 border-t border-border/50">
              <Skeleton className="h-4 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
