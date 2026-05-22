"use client"

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type StepStatus = 'pending' | 'in-progress' | 'complete' | 'failed'

type ExecStep = {
  id: number
  key: string
  title: string
  status: StepStatus
  progress: number
  reasoning: string
  signals: string[]
  updates: string[]
}

const initialSteps = (): ExecStep[] => [
  { id: 1, key: 'search', title: 'Searching Companies', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] },
  { id: 2, key: 'research', title: 'Researching Signals', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] },
  { id: 3, key: 'qualify', title: 'Qualifying Leads', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] },
  { id: 4, key: 'decision', title: 'Finding Decision-Makers', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] },
  { id: 5, key: 'draft', title: 'Drafting Outreach', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] },
  { id: 6, key: 'save', title: 'Saving to Pipeline', status: 'pending', progress: 0, reasoning: '', signals: [], updates: [] }
]

const mockReasoning = {
  search: 'Crawled public datasets, linked LinkedIn and Crunchbase to find matches for target ICP.',
  research: 'Extracted hiring signals, funding events, and tech stack changes indicating intent.',
  qualify: 'Filtered by company size, ARR signals, and engagement likelihood score.',
  decision: 'Mapped org charts and inferred likely decision-makers from titles and patterns.',
  draft: 'Generated tailored outreach using signals and a concise value proposition.',
  save: 'Persisted records with tags, notes, and next-step reminders.'
}

const mockSignals = {
  search: ['Industry: SaaS', 'Employee growth +12%', 'HQ: Remote'],
  research: ['Recent funding: Series B', 'New VP of Sales', 'Using competitor product'],
  qualify: ['ARR est: $5M', 'Headcount: 120', 'GTM: Enterprise'],
  decision: ['CEO: alice@x.com', 'Head of Sales: bob@x.com'],
  draft: ['Mention funding + value prop for ARR', 'Callout specific customer story'],
  save: ['Pipeline: Enterprise', 'Next Step: Intro email (3d)']
}

export default function ExecutionTimeline() {
  const [steps, setSteps] = useState<ExecStep[]>(initialSteps())
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    if (runningRef.current) return
    runningRef.current = true

    let current = 0

    const runNext = () => {
      if (current >= steps.length) return
      setSteps(prev => prev.map(s => s.id === current + 1 ? { ...s, status: 'in-progress', updates: [...s.updates, 'Started'] } : s))

      // progress simulation for current step
      let prog = 0
      const stepKey = steps[current].key as keyof typeof mockReasoning

      const interval = setInterval(() => {
        prog += Math.floor(Math.random() * 12) + 6 // jitter progress
        if (prog >= 100) prog = 100
        setSteps(prev => prev.map(s => s.id === current + 1 ? { ...s, progress: prog, updates: [...s.updates, `Progress ${prog}%`] } : s))

        if (prog >= 100) {
          clearInterval(interval)
          // finalize step
          setTimeout(() => {
            setSteps(prev => prev.map(s => s.id === current + 1 ? {
              ...s,
              status: 'complete',
              reasoning: (mockReasoning as any)[stepKey] || '',
              signals: (mockSignals as any)[stepKey] || [],
              updates: [...s.updates, 'Completed']
            } : s))
            current += 1
            // small delay between steps
            setTimeout(runNext, 600 + Math.random() * 800)
          }, 400)
        }
      }, 700)
    }

    // kick off simulation after tiny delay
    setTimeout(runNext, 800)

    return () => { runningRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center border border-white/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16v6" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#FFF" strokeWidth="1.2" opacity="0.18"/></svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Mission Timeline</h2>
          <p className="text-gray-400 text-sm">Autonomously executing a mission to discover and engage high-value prospects.</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/40 to-transparent" />

        <div className="space-y-6">
          {steps.map((s, idx) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="relative pl-20">
              <div className="absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: s.status === 'complete' ? '#10B981' : s.status === 'in-progress' ? '#7C3AED' : '#666' }}>
                <AnimatePresence>
                  {s.status === 'complete' ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-green-400">✓</motion.span>
                  ) : s.status === 'in-progress' ? (
                    <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-purple-400">⚙</motion.div>
                  ) : (
                    <motion.span initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="text-gray-400 text-sm">{s.id}</motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="card p-4 relative overflow-hidden">
                {s.status === 'in-progress' && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} />
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.status === 'complete' ? 'bg-green-500/20 text-green-400' : s.status === 'in-progress' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/10 text-gray-400'}`}>
                        {s.status === 'complete' ? 'Complete' : s.status === 'in-progress' ? 'Running' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{s.reasoning || 'Waiting for results…'}</p>
                  </div>

                  <div className="w-40 text-right">
                    <div className="text-sm text-gray-400">Progress</div>
                    <div className="text-xl font-bold mt-1">{s.progress}%</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full h-2 bg-white/5 rounded-xl overflow-hidden">
                    <motion.div className="h-2 rounded-xl" style={{ background: s.status === 'complete' ? 'linear-gradient(90deg,#10B981,#34D399)' : 'linear-gradient(90deg,#7C3AED,#4F46E5)' }} initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.6 }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{s.signals.length} signals</span>
                    <span className="mx-2">•</span>
                    <span>{s.updates.slice(-1)[0] || 'Idle'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleExpand(s.id)} className="text-sm text-blue-300 hover:underline">{expandedId === s.id ? 'Collapse' : 'View reasoning'}</button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === s.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 border-t border-white/6 pt-3 text-sm text-gray-300">
                      <div className="mb-2">
                        <strong className="text-gray-200">Reasoning</strong>
                        <p className="mt-1 text-gray-300">{s.reasoning || 'The agent will surface its reasoning here once the step completes.'}</p>
                      </div>

                      <div className="mb-2">
                        <strong className="text-gray-200">Extracted Signals</strong>
                        <ul className="mt-1 ml-4 list-disc text-gray-300">
                          {s.signals.length ? s.signals.map((sig, i) => <li key={i}>{sig}</li>) : <li className="text-gray-500">No signals yet</li>}
                        </ul>
                      </div>

                      <div>
                        <strong className="text-gray-200">Updates</strong>
                        <div className="mt-1 text-xs text-gray-400 max-h-28 overflow-auto">
                          {s.updates.length ? s.updates.map((u, i) => <div key={i} className="py-0.5">{u}</div>) : <div className="text-gray-500">No updates</div>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
