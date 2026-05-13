"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PlusCircle, 
  RefreshCcw, 
  Trash2, 
  UserPlus, 
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react"
import { getActivityRoute } from "@/utils/activity-helper"
import { cn } from "@/lib/utils"

const ICON_MAP: any = {
  CREATE: PlusCircle,
  UPDATE: RefreshCcw,
  DELETE: Trash2,
  STATUS_CHANGE: CheckCircle2,
  INVITE: UserPlus,
  JOIN: UserPlus,
};

const COLOR_MAP: any = {
  CREATE: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  UPDATE: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  DELETE: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
  STATUS_CHANGE: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  INVITE: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  JOIN: "text-primary bg-primary/10 dark:bg-primary/20",
};

export function ActivityFeed({ activities }: { activities: any[] }) {
  const router = useRouter()
  const displayActivities = activities.slice(0, 5)

  return (
    <Card className="col-span-full lg:col-span-3 border-muted-foreground/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
        <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {displayActivities.map((activity, index) => {
            const Icon = ICON_MAP[activity.actionType] || FileText;
            const colorClass = COLOR_MAP[activity.actionType] || "text-muted-foreground bg-muted";

            return (
              <div 
                key={activity._id} 
                className={cn(
                  "group flex items-center gap-4 p-4 transition-all duration-200 cursor-pointer hover:bg-muted/40 border-l-2 border-transparent hover:border-primary",
                  index !== displayActivities.length - 1 && "border-b border-border/50"
                )}
                onClick={() => router.push(getActivityRoute(activity.entityType))}
              >
                <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[13px] leading-tight font-medium truncate">
                    <span className="font-bold text-foreground">{activity.userId?.name || "Someone"}</span>
                    {" "}
                    <span className="text-muted-foreground">
                      {activity.actionType.toLowerCase().replace("_", " ")}d
                    </span>
                    {" "}
                    <span className="font-semibold text-primary/90">
                      {activity.metadata?.name || activity.metadata?.title || activity.entityType.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            );
          })}

          {displayActivities.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-muted rounded-full">
                <Clock className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium italic">
                No recent activity found.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
