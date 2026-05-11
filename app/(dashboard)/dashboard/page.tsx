import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { getDashboardStats, getChartData } from "@/actions/analytics-actions"
import { TaskTrendChart } from "@/components/dashboard/task-trend-chart"
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart"
import { TeamWorkloadChart } from "@/components/dashboard/team-workload-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default async function DashboardPage() {
  const session = await auth();
  const [statsRes, chartRes] = await Promise.all([
    getDashboardStats(),
    getChartData()
  ]);

  const stats = statsRes.stats;
  const recentActivities = statsRes.recentActivities;
  const statsError = statsRes.error;
  const { taskTrends, projectDistribution, workloadData, error: chartError } = chartRes;

  if (statsError || chartError) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl">
        <h2 className="text-xl font-bold text-rose-500">Error loading dashboard</h2>
        <p className="text-muted-foreground">{statsError || chartError}</p>
      </div>
    );
  }

  const METRICS = [
    { label: "Total Projects", value: stats?.totalProjects, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Tasks", value: stats?.pendingTasks, icon: ListTodo, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: stats?.completedTasks, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Overdue", value: stats?.overdueTasks, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}. Here&apos;s what&apos;s happening in your workspace.
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 gap-1.5 font-medium text-sm">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          Real-time activity tracking enabled
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="border-muted-foreground/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <TaskTrendChart data={taskTrends || []} />
        <ProjectStatusChart data={projectDistribution || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <TeamWorkloadChart data={workloadData || []} />
        <ActivityFeed activities={recentActivities || []} />
      </div>
    </div>
  )
}


