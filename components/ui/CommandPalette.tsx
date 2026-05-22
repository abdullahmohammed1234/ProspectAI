"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { searchIndex } from '../../lib/mockData'

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
  }, [open])

  useEffect(() => {
    if (!query) return setResults([])
    const q = query.toLowerCase()
    setResults(searchIndex.filter(s => s.title.toLowerCase().includes(q) || s.subtitle?.toLowerCase().includes(q)))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#09101A] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="flex gap-2">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search leads, missions, analytics..." className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/36 focus:border-white/20" />
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/72 transition hover:bg-white/10">Close</button>
        </div>
        <div className="mt-4 space-y-2">
          {results.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-white/46">No results</div>}
          {results.map(r => (
            <Link key={r.id} href={r.id === 's1' ? '/pipeline' : r.id === 's2' ? '/missions' : r.id === 's3' ? '/leads' : r.id === 's4' ? '/analytics' : `/leads/${r.id}`} className="block rounded-2xl border border-white/8 bg-white/4 px-4 py-3 transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8">
              <div className="font-medium text-white">{r.title}</div>
              {r.subtitle && <div className="text-sm text-white/52">{r.subtitle}</div>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
