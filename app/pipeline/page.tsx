import SidebarLayout from '../../components/SidebarLayout'
import Link from 'next/link'
import { leads } from '../../lib/mockData'

export default function PipelinePage() {
  return (
    <SidebarLayout>
      <div className="space-y-4">
        {leads.map(lead => (
          <div key={lead.id} className="card flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{lead.name}</h4>
              <p className="text-sm text-gray-300">{lead.company}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{lead.stage}</span>
              <Link href={`/leads/${lead.id}`} className="text-accent-blue">Details</Link>
            </div>
          </div>
        ))}
      </div>
    </SidebarLayout>
  )
}
