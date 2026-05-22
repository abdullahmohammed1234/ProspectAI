"use client"
import React, { useState } from 'react'
import Sidebar from './ui/Sidebar'
import TopNav from './ui/TopNav'

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(79,140,255,0.18),_transparent_28%),radial-gradient(circle_at_80%_0%,_rgba(16,185,129,0.12),_transparent_22%),linear-gradient(180deg,#081018_0%,#0b1118_48%,#060b10_100%)] text-slate-100">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-80">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
