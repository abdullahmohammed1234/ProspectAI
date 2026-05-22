import Link from 'next/link'
import SidebarLayout from '../../components/SidebarLayout'
import { missions } from '../../lib/mockData'

export default function MissionsPage() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Launch Mission CTA */}
        <Link href="/missions/launch" className="block group">
          <div className="card border-blue-400/30 bg-gradient-to-r from-blue-500/10 to-green-500/10 hover:from-blue-500/15 hover:to-green-500/15 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Launch New Mission</h3>
                  <p className="text-sm text-gray-400">Configure and deploy autonomous prospecting mission</p>
                </div>
              </div>
              <div className="text-2xl text-blue-400 group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </div>
        </Link>

        {/* Active Missions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Missions</h2>
          <div className="space-y-4">
            {missions.map(m => (
              <div key={m.id} className="card">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{m.title}</h4>
                    <p className="text-sm text-gray-300">{m.description}</p>
                  </div>
                  <div className="text-sm text-gray-400">{m.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
