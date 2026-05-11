import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, CheckCircle2, XCircle } from "lucide-react"

export function LeadStats({ leads }: { leads: any[] }) {
  const stats = {
    total: leads.length,
    won: leads.filter((l) => l.status === "WON").length,
    lost: leads.filter((l) => l.status === "LOST").length,
    active: leads.filter((l) => ["NEW", "CONTACTED", "NEGOTIATION"].includes(l.status)).length,
  }

  const CARDS = [
    { label: "Total Leads", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Leads", value: stats.active, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Closed Won", value: stats.won, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Closed Lost", value: stats.lost, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card) => (
        <Card key={card.label} className="border-muted-foreground/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
