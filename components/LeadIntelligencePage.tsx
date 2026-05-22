"use client"

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Lead } from '../types'
import { cn } from '../lib/utils'

type TabKey = 'overview' | 'research' | 'outreach' | 'activity'

type CollapsibleProps = {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(iso))
}

function getCompanyBadge(company: string) {
  return company
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
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

function Collapsible({ title, subtitle, defaultOpen = true, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-3xl border border-white/8 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-white/44">{title}</div>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-white/60">{subtitle}</p> : null}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="mt-1 text-white/46">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 p-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/58">{detail}</div>
    </div>
  )
}

function TimelineItem({ step, detail, status, tone }: { step: string; detail: string; status: string; tone: string }) {
  return (
    <div className="grid grid-cols-[14px_1fr] gap-4">
      <div className="relative flex justify-center">
        <span className={cn('mt-1 h-3 w-3 rounded-full border', tone)} />
        <span className="absolute top-4 h-full w-px bg-white/10" />
      </div>
      <div className="pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium text-white">{step}</div>
          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/54">
            {status}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
      </div>
    </div>
  )
}

export default function LeadIntelligencePage({ lead }: { lead: Lead }) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const companyBadge = useMemo(() => getCompanyBadge(lead.company), [lead.company])
  const scoreTone = useMemo(() => getScoreTone(lead.fitScore), [lead.fitScore])
  const scorePercent = Math.min(100, Math.max(0, lead.fitScore))
  const scoreGradient = `conic-gradient(from 180deg, rgba(79,140,255,0.95) 0deg, rgba(16,185,129,0.92) ${scorePercent * 3.6}deg, rgba(255,255,255,0.08) ${scorePercent * 3.6}deg 360deg)`

  const signalCount = lead.keyBusinessSignals.length
  const decisionMakerRole = lead.role ?? 'Decision-maker'
  const stage = lead.stage ?? 'Pipeline'

  const researchSummary = `AI synthesis suggests ${lead.company} is in an ${lead.outreachStatus.toLowerCase()} posture with a strong match around ${lead.industry}. The model is weighting hiring velocity, buying committee clarity, and the operational pressure implied by ${lead.keyBusinessSignals[0].toLowerCase()}.`

  const fitTakeaway = scorePercent >= 90
    ? 'This is a high-confidence account with immediate outbound potential and low relevance friction.'
    : scorePercent >= 80
      ? 'The account is close to threshold and should move into a tailored, lightly assisted motion.'
      : 'The fit is promising but timing and buying intent still need more proof before a strong push.'

  const reasoningTimeline = [
    {
      step: 'Signal ingestion',
      detail: `Enrichment picked up ${signalCount} relevant market signals and normalized them into the prospect profile.`,
      status: 'Complete',
      tone: 'border-sky-300/60 bg-sky-300/80'
    },
    {
      step: 'ICP match',
      detail: `Industry, role, and stage were compared against the playbook to estimate sales readiness and account quality.`,
      status: 'Complete',
      tone: 'border-emerald-300/60 bg-emerald-300/80'
    },
    {
      step: 'Score composition',
      detail: `The qualification score blends fit, timing, and access to the decision-maker. The current model favors ${lead.fitScore >= 80 ? 'a direct sales motion' : 'more research before outreach'}.`,
      status: 'Complete',
      tone: 'border-cyan-300/60 bg-cyan-300/80'
    },
    {
      step: 'Messaging angle',
      detail: `The outreach draft emphasizes ${lead.keyBusinessSignals[0].toLowerCase()} and keeps the opening tightly aligned with the decision-maker profile.`,
      status: 'Drafted',
      tone: 'border-amber-300/60 bg-amber-300/80'
    }
  ]

  const activityHistory = [
    {
      title: 'Lead enriched from public signals',
      detail: 'Company footprint, role, and buying context were updated after enrichment completed.',
      time: formatDateTime(lead.lastUpdated),
      tone: 'bg-sky-300/80'
    },
    {
      title: 'Qualification score recalculated',
      detail: `The model elevated the account to ${lead.fitScore}/100 after matching the current fit profile.`,
      time: '14 minutes ago',
      tone: 'bg-emerald-300/80'
    },
    {
      title: 'Outreach draft prepared',
      detail: 'A first-pass note was generated for review, with the suggested angle anchored to recent company signals.',
      time: '27 minutes ago',
      tone: 'bg-cyan-300/80'
    },
    {
      title: 'Notes added by strategist',
      detail: 'Human review flagged the account as ready for a personalized opener after final verification.',
      time: 'Today',
      tone: 'bg-amber-300/80'
    }
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'research', label: 'Research' },
    { key: 'outreach', label: 'Outreach' },
    { key: 'activity', label: 'Activity' }
  ] as const

  return (
    <div className="space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-[1px] shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,140,255,0.22),_transparent_30%),radial-gradient(circle_at_90%_10%,_rgba(16,185,129,0.18),_transparent_28%)]" />
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/8 bg-[#081018]/96 p-6 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/42">
                <span>Lead intelligence</span>
                <span className="h-1 w-1 rounded-full bg-white/24" />
                <span>{lead.industry}</span>
                <span className="h-1 w-1 rounded-full bg-white/24" />
                <span>{stage}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br text-xl font-semibold text-white shadow-[0_18px_36px_rgba(0,0,0,0.25)]', lead.fitScore >= 90 ? 'from-emerald-500/28 to-cyan-400/14' : 'from-blue-500/26 to-cyan-400/12')}>
                  {companyBadge}
                </div>
                <div>
                  <h1 className="font-display text-4xl tracking-[-0.05em] text-white sm:text-5xl">{lead.company}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/64">
                    Premium AI sales intelligence for {lead.name}. The platform consolidates fit, timing, and outreach context into a single operating view.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className={cn('rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em]', getStatusTone(lead.outreachStatus))}>
                  {lead.outreachStatus}
                </span>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                  {decisionMakerRole}
                </span>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                  Updated {formatDateTime(lead.lastUpdated)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
              <div className={cn('rounded-[1.75rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5', scoreTone)}>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white">Qualification score</div>
                <div className="mt-4 flex items-end gap-3">
                  <div className="text-5xl font-semibold tracking-[-0.06em] text-white">{lead.fitScore}</div>
                  <div className="pb-1 text-sm font-medium uppercase tracking-[0.2em] text-white">/100</div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white">{fitTakeaway}</p>
              </div>

              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Signal density</div>
                    <div className="mt-2 text-sm text-white/70">{signalCount} business signals captured</div>
                  </div>
                  <div className="relative h-24 w-24 rounded-full border border-white/8 p-2" style={{ backgroundImage: scoreGradient }}>
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#081018]">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{Math.round(scorePercent)}%</div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/42">fit</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(79,140,255,0.95),rgba(16,185,129,0.95))]" style={{ width: `${scorePercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Company overview" value={lead.industry} detail={`Role alignment: ${lead.role ?? 'Decision-maker not set'} and stage: ${stage}.`} />
            <MetricCard label="Research confidence" value={`${Math.max(82, lead.fitScore - 4)}%`} detail="Generated from enrichment, timing, and buying committee signals." />
            <MetricCard label="Outreach readiness" value={lead.fitScore >= 80 ? 'High' : 'Moderate'} detail="Draft quality is tuned for a personalized first touch." />
            <MetricCard label="Decision access" value={decisionMakerRole} detail={`Primary contact: ${lead.decisionMaker}.`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 rounded-full border border-white/8 bg-black/15 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition duration-200',
                  activeTab === tab.key
                    ? 'bg-white text-slate-950 shadow-[0_10px_25px_rgba(255,255,255,0.12)]'
                    : 'text-white/66 hover:bg-white/6 hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <Collapsible title="Company overview" subtitle="A concise operating summary of the account and its current context." defaultOpen>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Company snapshot</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {lead.company} sits in {lead.industry} with a clear ownership line to growth priorities. The account is currently tracked as {lead.outreachStatus.toLowerCase()} and is positioned for a tailored, account-specific motion.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">What the model sees</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      Timing, team structure, and the buying role suggest an account that is either ready to move or one step away from a meaningful conversation.
                    </p>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Fit analysis" subtitle="Why the score landed where it did and what to do next.">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Core fit</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">Strong alignment with the current ICP based on industry, role, and sales motion.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Timing</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">The account is active enough to justify outreach now, but timing remains the key sensitivity.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Risk</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">The largest risk is shallow signal depth, which can be offset with a personalized first email.</p>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="AI reasoning timeline" subtitle="How the platform assembled the lead score and outreach recommendation." defaultOpen>
                <div className="space-y-1">
                  {reasoningTimeline.map((item) => (
                    <TimelineItem key={item.step} step={item.step} detail={item.detail} status={item.status} tone={item.tone} />
                  ))}
                </div>
              </Collapsible>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-[0.28em] text-white/42">Qualification score breakdown</div>
                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Fit match', value: Math.min(100, lead.fitScore + 4) },
                    { label: 'Timing', value: Math.max(58, lead.fitScore - 12) },
                    { label: 'Access', value: Math.max(64, lead.fitScore - 8) },
                    { label: 'Message resonance', value: Math.max(70, lead.fitScore - 2) }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(79,140,255,0.85),rgba(16,185,129,0.9))]" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Collapsible title="Decision-maker profile" subtitle="The primary contact and why this person matters.">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Primary contact</div>
                    <div className="mt-2 text-base text-white">{lead.decisionMaker}</div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      This contact owns the revenue-facing priority most likely to feel the pain we solve, which makes them the highest leverage entry point.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/42">Persona angle</div>
                      <div className="mt-2 text-sm text-white/72">Operational efficiency</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/42">Best opener</div>
                      <div className="mt-2 text-sm text-white/72">Reference a recent growth or team-building signal.</div>
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'research' ? (
          <motion.div key="research" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <Collapsible title="AI-generated research summary" subtitle="A synthesized view of the account, market motion, and likely pain points." defaultOpen>
                <p className="text-sm leading-7 text-white/70">{researchSummary}</p>
              </Collapsible>

              <Collapsible title="Key signals" subtitle="Signals the model is prioritizing for this account." defaultOpen>
                <div className="flex flex-wrap gap-2">
                  {lead.keyBusinessSignals.map((signal) => (
                    <span key={signal} className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-white/74">
                      {signal}
                    </span>
                  ))}
                </div>
              </Collapsible>
            </div>

            <div className="space-y-5">
              <Collapsible title="Research narrative" subtitle="What the account likely cares about and how it should be framed." defaultOpen>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Problem frame</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">The company is likely under pressure to improve throughput while keeping the team lean and measurable.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Buying trigger</div>
                    <p className="mt-3 text-sm leading-7 text-white/68">Hiring, tooling change, or process rework could be the trigger that makes outreach timely.</p>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Notes section" subtitle="Human review area for strategist context and follow-up instructions." defaultOpen>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/18 p-4 text-sm leading-7 text-white/68">
                    Add a note after reviewing the AI summary. Capture objections, persona context, or any manual verification before send.
                  </div>
                  <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Suggested note</div>
                    <p className="mt-2 text-sm leading-7 text-white/72">
                      Validate whether {lead.company} is actively scaling this quarter and whether the outreach angle should emphasize speed, cost, or coordination.
                    </p>
                  </div>
                </div>
              </Collapsible>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'outreach' ? (
          <motion.div key="outreach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Collapsible title="Outreach draft panel" subtitle="A premium first-touch draft that can be reviewed, edited, and sent." defaultOpen>
                <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,15,22,0.96),rgba(10,15,22,0.82))] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-white/42">Suggested subject</div>
                      <div className="mt-2 text-sm text-white/78">A quick note on your growth motion at {lead.company}</div>
                    </div>
                    <span className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-100">
                      Ready to edit
                    </span>
                  </div>

                  <div className="space-y-4 pt-4 text-sm leading-7 text-white/72">
                    <p>Hi {lead.name.split(' ')[0]},</p>
                    <p>
                      I saw {lead.company} expanding around {lead.keyBusinessSignals[0].toLowerCase()}. Teams at your stage usually run into a coordination tax once the process starts scaling faster than the tooling.
                    </p>
                    <p>
                      We help growth teams reduce that friction without adding operational overhead. If it is useful, I can send over a quick breakdown tailored to your current motion.
                    </p>
                    <p>Worth a short look this week?</p>
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Decision-maker profile" subtitle="The context the sender should keep in view." defaultOpen>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Title</div>
                    <div className="mt-2 text-sm text-white/74">{lead.decisionMaker}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/42">Outreach posture</div>
                    <div className="mt-2 text-sm text-white/74">Concise, relevant, and low-friction</div>
                  </div>
                </div>
              </Collapsible>
            </div>

            <div className="space-y-5">
              <Collapsible title="Notes section" subtitle="Capture internal commentary before sending the draft." defaultOpen>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-7 text-white/68">
                    Use this space for objections, handoff notes, or any instruction that should travel with the account.
                  </div>
                  <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-4 text-sm leading-7 text-white/72">
                    Example: confirm whether the company is piloting a new outbound motion before opening with tooling efficiency.
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Send-state controls" subtitle="A UI block that makes the panel feel like a premium workspace." defaultOpen>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Draft status" value="Human review" detail="Waiting on strategist approval before queueing." />
                  <MetricCard label="Confidence" value={`${Math.max(84, lead.fitScore - 2)}%`} detail="Message is aligned to the current buying context." />
                </div>
              </Collapsible>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'activity' ? (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <Collapsible title="Activity history" subtitle="A chronological view of the latest intelligence and workflow events." defaultOpen>
                <div className="space-y-2">
                  {activityHistory.map((item) => (
                    <div key={item.title} className="grid grid-cols-[14px_1fr] gap-4">
                      <div className="relative flex justify-center">
                        <span className={cn('mt-1 h-3 w-3 rounded-full border border-white/16', item.tone)} />
                        <span className="absolute top-4 h-full w-px bg-white/10" />
                      </div>
                      <div className="pb-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-white">{item.title}</div>
                          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/54">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/62">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
            </div>

            <div className="space-y-5">
              <Collapsible title="Notes section" subtitle="Persistent strategist notes for this lead." defaultOpen>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-7 text-white/68">
                    Current note: prioritize a short opener, use the company signal as proof, and avoid over-explaining the platform in the first touch.
                  </div>
                  <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-4 text-sm leading-7 text-white/72">
                    Follow-up note: if the first email gets a reply, move directly to a problem-led discovery frame and keep the next step lightweight.
                  </div>
                </div>
              </Collapsible>

              <Collapsible title="Research summary" subtitle="Condensed readout for a quick review." defaultOpen>
                <p className="text-sm leading-7 text-white/70">{researchSummary}</p>
              </Collapsible>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}