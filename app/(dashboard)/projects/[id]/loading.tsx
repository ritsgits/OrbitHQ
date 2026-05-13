import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-8 flex flex-col h-full pb-10">
      {/* Header Section Skeleton */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-8 bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-muted-foreground/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted" />
        
        <div className="space-y-6 max-w-3xl flex-1 w-full">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-96" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-10" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full xl:w-80 space-y-6">
          <Card className="p-6 bg-muted/30 border-border/50">
            <div className="flex justify-between items-end mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-32 mx-auto mt-3" />
          </Card>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/20 rounded-2xl p-4 border border-border/50 space-y-4">
                <div className="flex justify-between px-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-6 rounded-full" />
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="rounded-3xl border-muted-foreground/10 bg-card/30 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
