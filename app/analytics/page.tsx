import SidebarLayout from '../../components/SidebarLayout'
import { analyticsHighlights, channelBreakdown, leadTrend } from '../../lib/mockData'

export default function AnalyticsPage() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/42">Analytics</p>
          <h1 className="mt-2 font-display text-3xl tracking-[-0.04em] text-white">Performance trends</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">A lightweight analytics surface for conversion, channel mix, and recent lead activity.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {analyticsHighlights.map((item) => (
            <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-[#0A1018]/95 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/42">{item.label}</div>
              <div className="mt-2 text-3xl font-semibold text-white">{item.value}</div>
              <div className="mt-2 text-sm text-emerald-200">{item.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0A1018]/95 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/42">Trend</div>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Lead velocity</h2>
            <div className="mt-6 grid grid-cols-7 gap-3">
              {leadTrend.map((point) => (
                <div key={point.label} className="rounded-2xl border border-white/8 bg-white/5 px-2 py-3 text-center">
                  <div className="text-xs text-white/42">{point.label}</div>
                  <div className="mt-2 text-lg font-semibold text-white">{point.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0A1018]/95 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/42">Channel mix</div>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Source performance</h2>
            <div className="mt-6 space-y-4">
              {channelBreakdown.map((channel) => (
                <div key={channel.label}>
                  <div className="flex items-center justify-between text-sm text-white/66">
                    <span>{channel.label}</span>
                    <span>{channel.value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#10B981)]" style={{ width: `${channel.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}