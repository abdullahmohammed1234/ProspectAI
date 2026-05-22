"use client"

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Lead } from '../types'
import { cn } from '../lib/utils'

type Props = {
  lead: Lead
  onArchive?: (leadId: string) => void
}

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(iso))
}

function getScoreTone(score: number) {
  if (score >= 90) return 'from-emerald-300 to-cyan-300 text-emerald-950 border-emerald-300/35'
  if (score >= 80) return 'from-sky-300 to-blue-300 text-sky-950 border-sky-300/35'
  if (score >= 70) return 'from-amber-300 to-orange-300 text-amber-950 border-amber-300/35'
  return 'from-rose-300 to-red-300 text-rose-950 border-rose-300/35'
}

function getStatusTone(status: Lead['outreachStatus']) {
  switch (status) {
    case 'Qualified':
      return 'border-emerald-400/20 bg-emerald-400/12 text-emerald-100'
    case 'In conversation':
      return 'border-cyan-400/20 bg-cyan-400/12 text-cyan-100'
    case 'Researching':
      return 'border-amber-400/20 bg-amber-400/12 text-amber-100'
    case 'Archived':
      return 'border-white/10 bg-white/6 text-white/60'
    default:
      return 'border-white/10 bg-white/6 text-white/70'
  }
}

function getIndustryTone(industry: string) {
  const seed = industry.length % 3
  if (seed === 0) return 'from-blue-500/25 to-cyan-400/10'
  if (seed === 1) return 'from-emerald-500/22 to-teal-400/10'
  return 'from-violet-500/20 to-indigo-400/10'
}

function getCompanyBadge(company: string) {
  return company
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function LeadIntelligenceCard({ lead, onArchive }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [saved, setSaved] = useState(false)

  const scoreTone = useMemo(() => getScoreTone(lead.fitScore), [lead.fitScore])
  const companyBadge = useMemo(() => getCompanyBadge(lead.company), [lead.company])

  return (
    <motion.article
      layout
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-[1px] shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,140,255,0.22),_transparent_34%),radial-gradient(circle_at_80%_0%,_rgba(16,185,129,0.16),_transparent_30%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#09101A]/96 p-5 backdrop-blur-xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-70" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br text-lg font-display font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.28)]', getIndustryTone(lead.industry))}>
              <span>{companyBadge}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl tracking-[-0.04em] text-white">{lead.company}</h3>
                <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/56">
                  {lead.industry}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/58">Decision-maker: <span className="text-white/86">{lead.decisionMaker}</span></p>
              <p className="mt-1 text-sm text-white/48">Updated {formatTimestamp(lead.lastUpdated)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <span className={cn('rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]', getStatusTone(lead.outreachStatus))}>
              {lead.outreachStatus}
            </span>

            <div className={cn('rounded-2xl border bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3', scoreTone)}>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white">Fit score</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-3xl font-semibold tracking-[-0.05em] text-white">{lead.fitScore}</div>
                <div className="pb-1 text-xs font-medium uppercase tracking-[0.2em] text-white">/100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-4 transition duration-300 group-hover:border-white/12 group-hover:bg-white/8">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.28em] text-white/42">Qualification reasoning</div>
              <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/56">
                Premium signal
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/66">{lead.qualificationReasoning}</p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(79,140,255,0.12),rgba(255,255,255,0.04))] p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-white/42">Key business signals</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.keyBusinessSignals.slice(0, 4).map((signal) => (
                <span key={signal} className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-white/74">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSaved((current) => !current)}
              className={cn('rounded-full border px-3 py-2 text-xs font-medium transition duration-200', saved ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-100' : 'border-white/10 bg-white/6 text-white/72 hover:bg-white/10')}
            >
              {saved ? 'Saved' : 'Save lead'}
            </button>
            {onArchive ? (
              <button
                type="button"
                onClick={() => onArchive(lead.id)}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/72 transition duration-200 hover:border-white/16 hover:bg-white/10 hover:text-white"
              >
                Archive
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium text-white/78 transition duration-200 hover:border-white/16 hover:bg-white/10 hover:text-white"
          >
            {expanded ? 'Collapse details' : 'Expand details'}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
              ▾
            </motion.span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid gap-4 rounded-3xl border border-white/8 bg-black/15 p-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">Decision-maker</div>
                  <div className="mt-2 text-sm text-white/82">{lead.decisionMaker}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">Outreach status</div>
                  <div className="mt-2 text-sm text-white/82">{lead.outreachStatus}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">Last updated</div>
                  <div className="mt-2 text-sm text-white/82">{formatTimestamp(lead.lastUpdated)}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {lead.keyBusinessSignals.map((signal) => (
                  <div key={signal} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70">
                    {signal}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs uppercase tracking-[0.22em] text-white/40">
          <span>{lead.name}</span>
          <span>{lead.company}</span>
        </div>
      </div>
    </motion.article>
  )
}