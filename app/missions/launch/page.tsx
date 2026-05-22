import SidebarLayout from '../../../components/SidebarLayout'
import LaunchMissionForm from '../../../components/LaunchMissionForm'

export const metadata = {
  title: 'Launch Mission | ProspectAI',
  description: 'Configure and launch a new autonomous prospecting mission'
}

export default function LaunchMissionPage() {
  return (
    <SidebarLayout>
      <div className="w-full">
        {/* Page background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-green-600/5 pointer-events-none" />

        {/* Content */}
        <div className="relative py-8 px-6">
          <LaunchMissionForm />
        </div>
      </div>
    </SidebarLayout>
  )
}
