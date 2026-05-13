"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getActivityRoute } from "@/utils/activity-helper"
import { Bell, CheckCircle2, ListTodo, Target, Briefcase, Users, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getRecentActivityAction } from "@/actions/notification-actions"
import { cn } from "@/lib/utils"

const icons = {
  PROJECT: Briefcase,
  TASK: ListTodo,
  LEAD: Target,
  MEMBER: Users,
  WORKSPACE: CheckCircle2,
}

const colors = {
  CREATE: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  UPDATE: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  DELETE: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
  STATUS_CHANGE: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  INVITE: "text-violet-500 bg-violet-500/10 dark:bg-violet-500/20",
  JOIN: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
}

export function NotificationCenter() {
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchActivities = async () => {
    const result = await getRecentActivityAction()
    if (result.activities) {
      setActivities(result.activities)
      setUnreadCount(result.activities.length)
    }
  }

  useEffect(() => {
    fetchActivities()
    const interval = setInterval(fetchActivities, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = (entityType: string) => {
    router.push(getActivityRoute(entityType))
  }

  const displayActivities = activities.slice(0, 5)

  return (
    <DropdownMenu onOpenChange={(open) => open && setUnreadCount(0)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group transition-all duration-300 hover:bg-primary/10">
          <Bell className="h-5 w-5 transition-colors group-hover:text-primary" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-2xl border-muted-foreground/10 bg-popover/95 backdrop-blur-xl">
        <div className="p-4 bg-muted/30 flex items-center justify-between border-b border-border/50">
          <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold bg-muted px-2 py-0.5 rounded-full">Activity</span>
        </div>
        
        <div className="flex flex-col">
          {displayActivities.length > 0 ? (
            displayActivities.map((activity, index) => {
              const Icon = icons[activity.entityType as keyof typeof icons] || Clock
              const colorClass = colors[activity.actionType as keyof typeof colors] || "text-muted-foreground bg-muted"
              
              return (
                <div key={activity._id}>
                  <DropdownMenuItem 
                    onSelect={() => handleNotificationClick(activity.entityType)}
                    className="flex flex-col items-start p-4 gap-2 focus:bg-muted/80 cursor-pointer transition-all duration-200 group border-l-2 border-transparent hover:border-primary"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[13px] leading-tight font-medium">
                          <span className="font-bold text-foreground">{activity.userId?.name || "Someone"}</span>
                          {" "}
                          <span className="text-muted-foreground">
                            {activity.actionType.toLowerCase().replace("_", " ")}
                          </span>
                          {" "}
                          <span className="font-semibold text-primary/90">
                            {activity.entityType.toLowerCase()}
                          </span>
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </DropdownMenuItem>
                  {index < displayActivities.length - 1 && <DropdownMenuSeparator className="m-0 opacity-50" />}
                </div>
              )
            })
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <div className="p-3 bg-muted rounded-full">
                <Bell className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No recent activity</p>
            </div>
          )}
        </div>

        {displayActivities.length > 0 && (
          <div className="p-2 bg-muted/20 text-center border-t border-border/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-transparent transition-colors font-semibold"
              onClick={() => router.push("/dashboard")}
            >
              View all activity
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
