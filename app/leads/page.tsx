"use client"

import { useMemo, useState } from 'react'
import SidebarLayout from '../../components/SidebarLayout'
import LeadIntelligenceCard from '../../components/LeadIntelligenceCard'
import { leads } from '../../lib/mockData'

const initialArchived: string[] = []

export default function LeadsPage() {
  const [activeLeadIds, setActiveLeadIds] = useState(leads.map((lead) => lead.id))
  const [archivedLeadIds, setArchivedLeadIds] = useState<string[]>(initialArchived)

  const activeLeads = useMemo(
    () => leads.filter((lead) => activeLeadIds.includes(lead.id)),
    [activeLeadIds]
  )

  const archivedCount = archivedLeadIds.length

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-white/42">Leads</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-[-0.04em] text-white sm:text-4xl">Lead intelligence cards</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Review premium account briefs, expand the underlying reasoning, and save or archive prospects as they move through the motion.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.24em] text-white/42">Active</div>
                <div className="mt-2 text-2xl font-semibold text-white">{activeLeads.length}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.24em] text-white/42">Archived</div>
                <div className="mt-2 text-2xl font-semibold text-white">{archivedCount}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.24em] text-white/42">Average fit</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(activeLeads.reduce((sum, lead) => sum + lead.fitScore, 0) / (activeLeads.length || 1))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {activeLeads.map((lead) => (
            <LeadIntelligenceCard
              key={lead.id}
              lead={lead}
              onArchive={(leadId) => {
                setActiveLeadIds((current) => current.filter((id) => id !== leadId))
                setArchivedLeadIds((current) => (current.includes(leadId) ? current : [...current, leadId]))
              }}
            />
          ))}
        </div>
      </div>
    </SidebarLayout>
  )
}