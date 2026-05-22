"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import CommandPalette from './CommandPalette'
import { notifications } from '../../lib/mockData'

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/72 transition hover:border-white/16 hover:bg-white/10 lg:hidden"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 text-sm font-medium text-white/76 transition hover:border-white/16 hover:bg-white/10 md:min-w-[280px] md:flex-none md:justify-start"
        >
          <span className="mr-3 text-white/50">⌘K</span>
          Search leads, missions, or notes
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/72 xl:flex">
            {notifications.map((notification) => (
              <span key={notification.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${notification.tone === 'green' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <span>{notification.label}</span>
              </span>
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:border-white/16 hover:bg-white/10"
            aria-label="Notifications"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)]" />
          </motion.button>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4F8CFF,#10B981)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,140,255,0.25)]">
              JS
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-white">Jordan Stone</div>
              <div className="text-xs text-white/48">Growth lead</div>
            </div>
          </div>
        </div>
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </header>
  )
}
