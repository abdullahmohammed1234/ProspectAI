import Link from 'next/link'
import SidebarLayout from '../../components/SidebarLayout'
import {
  activityFeed,
  analyticsHighlights,
  channelBreakdown,
  dashboardStats,
  drafts,
  leadTrend,
  missions
} from '../../lib/mockData'

function buildLinePath(points: number[], width: number, height: number) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * width
      const y = height - ((point - min) / range) * (height - 12) - 6
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function buildAreaPath(points: number[], width: number, height: number) {
  const linePath = buildLinePath(points, width, height)
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

export default function DashboardPage() {
  const chartWidth = 540
  const chartHeight = 260
  const values = leadTrend.map((point) => point.value)
  const linePath = buildLinePath(values, chartWidth, chartHeight)
  const areaPath = buildAreaPath(values, chartWidth, chartHeight)

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/42">Dashboard overview</p>
                <h1 className="mt-3 font-display text-3xl tracking-[-0.04em] text-white sm:text-4xl">Prospecting command center</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                  Track lead volume, launch new missions, and review outreach performance from a single operational surface.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <div className="font-medium">Autopilot running</div>
                <div className="mt-1 text-emerald-100/72">12 sequences active, 4 reviews pending</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {dashboardStats.map((stat) => (
                <div key={stat.id} className="group rounded-3xl border border-white/8 bg-white/5 p-4 transition duration-200 hover:-translate-y-1 hover:border-white/14 hover:bg-white/8">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">{stat.title}</div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div className="font-display text-3xl tracking-[-0.04em] text-white">{stat.value}</div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-white/72">{stat.delta}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/56">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#0A1018]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/42">Notifications</p>
                  <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Work queue</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/60">Live</div>
              </div>

              <div className="mt-5 space-y-3">
                {activityFeed.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">{entry.title}</div>
                        <div className="mt-1 text-sm leading-6 text-white/55">{entry.detail}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">{entry.tag}</div>
                    </div>
                    <div className="mt-3 text-xs text-white/38">{entry.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(79,140,255,0.13),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="text-xs uppercase tracking-[0.3em] text-white/42">User profile</div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F8CFF,#10B981)] text-lg font-semibold text-white shadow-[0_14px_26px_rgba(79,140,255,0.22)]">
                  JS
                </div>
                <div>
                  <div className="text-lg font-medium text-white">Jordan Stone</div>
                  <div className="text-sm text-white/56">Growth lead · prospectai@studio.com</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {analyticsHighlights.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/42">{item.label}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-sm text-emerald-200">{item.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#09101A]/94 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Chart</p>
                <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Lead volume trend</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/60">Last 7 days</div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/4 p-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 w-full">
                <defs>
                  <linearGradient id="lead-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#4F8CFF" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="lead-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(79,140,255,0.45)" />
                    <stop offset="100%" stopColor="rgba(79,140,255,0.02)" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((ratio) => (
                  <line key={ratio} x1="0" x2={chartWidth} y1={chartHeight * ratio} y2={chartHeight * ratio} stroke="rgba(255,255,255,0.08)" strokeDasharray="6 8" />
                ))}
                <path d={areaPath} fill="url(#lead-fill)" />
                <path d={linePath} fill="none" stroke="url(#lead-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {leadTrend.map((point, index) => {
                  const x = (index / (leadTrend.length - 1 || 1)) * chartWidth
                  const min = Math.min(...values)
                  const max = Math.max(...values)
                  const range = max - min || 1
                  const y = chartHeight - ((values[index] - min) / range) * (chartHeight - 12) - 6
                  return <circle key={point.label} cx={x} cy={y} r="4.5" fill="#E5F2FF" stroke="#4F8CFF" strokeWidth="2" />
                })}
              </svg>

              <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs text-white/40">
                {leadTrend.map((point) => (
                  <div key={point.label} className="rounded-xl border border-white/6 bg-white/4 px-2 py-2">
                    <div className="font-medium text-white/62">{point.label}</div>
                    <div className="mt-1 text-sm text-white">{point.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0A1018]/95 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Channel mix</p>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Outreach conversion</h2>

            <div className="mt-6 space-y-4">
              {channelBreakdown.map((channel) => (
                <div key={channel.label}>
                  <div className="flex items-center justify-between text-sm text-white/66">
                    <span>{channel.label}</span>
                    <span>{channel.value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#10B981)] shadow-[0_0_20px_rgba(79,140,255,0.35)] transition-all duration-300 hover:brightness-110" style={{ width: `${channel.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">Conversion rate</div>
                  <div className="mt-2 font-display text-4xl tracking-[-0.05em] text-white">19.8%</div>
                </div>
                <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">Placeholder</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/56">This metric is reserved for the final scoring model and currently acts as a visual placeholder.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#09101A]/94 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Missions</p>
                <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Active outreach</h2>
              </div>
              <Link href="/missions" className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10">View all</Link>
            </div>

            <div className="mt-6 space-y-3">
              {missions.map((mission) => (
                <div key={mission.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{mission.title}</div>
                      <div className="mt-1 text-sm leading-6 text-white/56">{mission.description}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-white/72">{mission.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {drafts.map((draft) => (
                <div key={draft.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{draft.title}</div>
                    <span className="text-xs text-emerald-200">{draft.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/54">{draft.preview}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Activity feed</p>
                <h2 className="mt-1 font-display text-2xl tracking-[-0.04em] text-white">Recent system activity</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/60">Auto-updating</div>
            </div>

            <div className="mt-6 space-y-3">
              {activityFeed.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white">
                      {entry.tag.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-white">{entry.title}</h3>
                        <span className="text-xs text-white/42">{entry.time}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-white/56">{entry.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SidebarLayout>
  )
}
