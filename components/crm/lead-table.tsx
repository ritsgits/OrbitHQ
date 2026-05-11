"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2, 
  Trash2,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteLead, updateLeadStatus } from "@/actions/lead-actions"
import { useRouter } from "next/navigation"

const STATUS_CONFIG: any = {
  NEW: { label: "New", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  CONTACTED: { label: "Contacted", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  NEGOTIATION: { label: "Negotiation", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  WON: { label: "Won", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  LOST: { label: "Lost", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
}

export function LeadTable({ leads }: { leads: any[] }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsLoading(id)
    try {
      const res = await updateLeadStatus(id, status)
      if (res.success) router.refresh()
    } finally {
      setIsLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    setIsLoading(id)
    try {
      const res = await deleteLead(id)
      if (res.success) router.refresh()
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned To</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{lead.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={`h-7 gap-1 px-2 font-medium border ${STATUS_CONFIG[lead.status].color}`}>
                        {STATUS_CONFIG[lead.status].label}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {Object.keys(STATUS_CONFIG).map((status) => (
                        <DropdownMenuItem 
                          key={status} 
                          onClick={() => handleStatusUpdate(lead._id, status)}
                          className="text-xs"
                        >
                          {STATUS_CONFIG[status].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {lead.assignedTo?.name || "Unassigned"}
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading === lead._id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDelete(lead._id)}
                        className="text-rose-500 focus:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                  No leads found. Start by adding a new lead!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
