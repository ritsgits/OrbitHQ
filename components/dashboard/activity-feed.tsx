import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  PlusCircle, 
  RefreshCcw, 
  Trash2, 
  UserPlus, 
  CheckCircle2,
  FileText
} from "lucide-react"

const ICON_MAP: any = {
  CREATE: PlusCircle,
  UPDATE: RefreshCcw,
  DELETE: Trash2,
  STATUS_CHANGE: CheckCircle2,
  INVITE: UserPlus,
  JOIN: UserPlus,
};

const COLOR_MAP: any = {
  CREATE: "text-emerald-500",
  UPDATE: "text-blue-500",
  DELETE: "text-rose-500",
  STATUS_CHANGE: "text-amber-500",
  INVITE: "text-purple-500",
  JOIN: "text-primary",
};

export function ActivityFeed({ activities }: { activities: any[] }) {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = ICON_MAP[activity.actionType] || FileText;
            const colorClass = COLOR_MAP[activity.actionType] || "text-muted-foreground";

            return (
              <div key={activity._id} className="flex gap-4 relative">
                <div className="mt-1 relative z-10">
                  <div className={`p-2 rounded-full bg-muted/50 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.userId?.name}</span>
                    {" "}
                    <span className="text-muted-foreground">
                      {activity.actionType.toLowerCase().replace("_", " ")}d
                    </span>
                    {" "}
                    <span className="font-medium">
                      {activity.metadata?.name || activity.metadata?.title || activity.entityType.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10 italic">
              No recent activity found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
