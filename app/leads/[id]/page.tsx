import SidebarLayout from '../../../components/SidebarLayout'
import LeadIntelligencePage from '../../../components/LeadIntelligencePage'
import { getLead } from '../../../lib/mockData'

type Props = { params: Promise<{ id: string }> }

export default async function LeadDetails({ params }: Props) {
  const { id } = await params
  const lead = getLead(id)

  if (!lead) return (
    <SidebarLayout>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white/80 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">Lead not found</div>
    </SidebarLayout>
  )

  return (
    <SidebarLayout>
      <LeadIntelligencePage lead={lead} />
    </SidebarLayout>
  )
}
