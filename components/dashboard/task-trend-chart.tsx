import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Zap, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function TaskTrendChart({ data, productivity }: { data: any[], productivity: any }) {
  const stats = productivity || { completionRate: 0, tasksCompletedThisWeek: 0, totalTasks: 0 };
  
  return (
    <Card className="col-span-full lg:col-span-4 border-muted-foreground/10 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5">
      <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Productivity Insights
        </CardTitle>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
          LIVE METRICS
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Completion Rate</h4>
              </div>
              <span className="text-2xl font-black">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-[10px] text-muted-foreground font-medium">
              Overall task completion across the workspace.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Weekly Output</h4>
              </div>
              <span className="text-2xl font-black">{stats.tasksCompletedThisWeek}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {data.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-emerald-500/20 rounded-t-sm transition-all hover:bg-emerald-500/40 cursor-help"
                    style={{ height: `${Math.max(day.completed * 10, 4)}px` }}
                    title={`${day.completed} tasks on ${day.name}`}
                  />
                  <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">{day.name.split(" ")[1]}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Tasks finished in the last 7 days.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1">
            <Zap className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Efficiency</span>
            <span className="text-lg font-black">High</span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1">
            <CheckCircle2 className="h-4 w-4 text-primary mb-1" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Done</span>
            <span className="text-lg font-black">{stats.totalTasks}</span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1">
            <Target className="h-4 w-4 text-rose-500 mb-1" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Focus</span>
            <span className="text-lg font-black">Velocity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
