import { getLeads } from "@/actions/lead-actions"
import { CreateLeadDialog } from "@/components/crm/create-lead-dialog"
import { LeadTable } from "@/components/crm/lead-table"
import { LeadStats } from "@/components/crm/lead-stats"

export default async function CRMPage() {
  const { data: leads = [], error } = await getLeads()

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track potential leads.
          </p>
        </div>
        <CreateLeadDialog />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}

      <LeadStats leads={leads} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">All Leads</h3>
        </div>
        <LeadTable leads={leads} />
      </div>
    </div>
  )
}
