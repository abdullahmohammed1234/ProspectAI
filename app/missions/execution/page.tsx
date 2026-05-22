'use client'

import SidebarLayout from '../../../components/SidebarLayout'
import ExecutionTimeline from '../../../components/ExecutionTimeline'

export default function ExecutionPage() {
  return (
    <SidebarLayout>
      <div className="w-full py-8">
        <ExecutionTimeline />
      </div>
    </SidebarLayout>
  )
}
