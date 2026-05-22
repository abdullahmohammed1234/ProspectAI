"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { leads, sidebarItems } from '../../lib/mockData'

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 bg-[#09101A]/92 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:flex lg:flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="text-sm uppercase tracking-[0.24em] text-white/45">Navigation</div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10">Close</button>
        </div>
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F8CFF,#10B981)] font-display text-lg font-semibold text-white shadow-[0_14px_30px_rgba(79,140,255,0.28)]">
            P
          </div>
          <div>
            <div className="font-display text-lg tracking-tight text-white">ProspectAI</div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/45">Enterprise prospecting</div>
          </div>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${active ? 'border-white/12 bg-white/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.25)]' : 'border-transparent text-white/64 hover:border-white/10 hover:bg-white/6 hover:text-white'}`}
              >
                <span>{item.label}</span>
                <motion.span
                  className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]' : 'bg-white/24 group-hover:bg-white/40'}`}
                  whileHover={{ scale: 1.25 }}
                />
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(255,255,255,0.03))] p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
            <span>Recent leads</span>
            <span>{leads.length}</span>
          </div>
          <ul className="mt-4 space-y-2">
            {leads.slice(0, 4).map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 px-4 py-3 text-sm text-white/78 transition duration-200 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8 hover:text-white"
                >
                  <span>
                    <span className="block font-medium text-white">{lead.name}</span>
                    <span className="block text-xs text-white/48">{lead.company}</span>
                  </span>
                  <span className="text-xs text-emerald-300">{lead.stage}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
