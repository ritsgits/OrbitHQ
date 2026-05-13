import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

export function TeamWorkloadChart({ data }: { data: any[] }) {
  const getWorkloadStatus = (tasks: number) => {
    if (tasks <= 3) return { label: "Balanced", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (tasks <= 6) return { label: "Busy", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { label: "Overloaded", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  return (
    <Card className="col-span-full lg:col-span-4 border-muted-foreground/10 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5">
      <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Team Workload
        </CardTitle>
        <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
          {data.length} Members Active
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50">
          {data.map((member, index) => {
            const status = getWorkloadStatus(member.tasks);
            return (
              <div key={index} className="p-5 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={member.image} />
                    <AvatarFallback className="font-bold bg-primary/10 text-primary text-xs">
                      {member.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[120px] group-hover:text-primary transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {member.tasks} Active {member.tasks === 1 ? 'Task' : 'Tasks'}
                    </p>
                  </div>
                </div>
                <div className={cn("px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest", status.bg, status.color, status.border)}>
                  {status.label}
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground italic">
              No team activity recorded yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
