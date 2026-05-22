export const cards = [
  { id: 'c1', title: 'Pipeline health', subtitle: 'Overview of open opportunities' },
  { id: 'c2', title: 'Missions', subtitle: 'Active outreach sequences' },
  { id: 'c3', title: 'Leads', subtitle: 'New and warm leads' }
]

export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'missions', label: 'Missions', href: '/missions' },
  { id: 'pipeline', label: 'Pipeline', href: '/pipeline' },
  { id: 'leads', label: 'Leads', href: '/leads' },
  { id: 'analytics', label: 'Analytics', href: '/analytics' },
  { id: 'settings', label: 'Settings', href: '/settings' }
]

export const dashboardStats = [
  { id: 'total-leads', title: 'Total Leads', value: '1,284', delta: '+18.2%', note: 'Across 42 target accounts' },
  { id: 'qualified-leads', title: 'Qualified Leads', value: '376', delta: '+11.4%', note: 'Shortlisted from this week' },
  { id: 'active-missions', title: 'Active Missions', value: '14', delta: '+3', note: 'Sequences currently running' },
  { id: 'outreach-drafts', title: 'Outreach Drafts', value: '89', delta: '+27', note: 'Awaiting review and send' },
  { id: 'conversion-rate', title: 'Conversion Rate', value: '19.8%', delta: 'Target 22%', note: 'Placeholder until model tunes' }
]

export const leadTrend = [
  { label: 'Mon', value: 32 },
  { label: 'Tue', value: 41 },
  { label: 'Wed', value: 36 },
  { label: 'Thu', value: 52 },
  { label: 'Fri', value: 61 },
  { label: 'Sat', value: 47 },
  { label: 'Sun', value: 68 }
]

export const channelBreakdown = [
  { label: 'Email', value: 58 },
  { label: 'LinkedIn', value: 42 },
  { label: 'Warm intro', value: 31 },
  { label: 'Partner motion', value: 19 }
]

export const activityFeed = [
  {
    id: 'a1',
    title: 'Outreach draft approved for Nimbus',
    detail: 'Sequence includes a personalized sales hiring angle and a follow-up reminder.',
    time: '2m ago',
    tag: 'Draft'
  },
  {
    id: 'a2',
    title: 'Missions autopilot queued 18 new targets',
    detail: 'New accounts matched the revenue ops ICP and passed enrichment checks.',
    time: '18m ago',
    tag: 'Mission'
  },
  {
    id: 'a3',
    title: 'Qualified lead score improved for Aurora',
    detail: 'Funding signal and hiring velocity pushed the intent score above threshold.',
    time: '41m ago',
    tag: 'Lead'
  },
  {
    id: 'a4',
    title: 'Pipeline review completed by Jordan',
    detail: 'Three stalled opportunities were reassigned to a nurture sequence.',
    time: '1h ago',
    tag: 'Review'
  }
]

export const notifications = [
  { id: 'n1', label: '3 unread alerts', tone: 'blue' },
  { id: 'n2', label: '1 sequence needs review', tone: 'green' }
]

export const drafts = [
  { id: 'd1', title: 'Nimbus founder intro', status: 'Ready', preview: 'Mention the recent sales hire and the new outbound motion.' },
  { id: 'd2', title: 'Aurora follow-up', status: 'Editing', preview: 'Lead with their hiring momentum and recent product launch.' },
  { id: 'd3', title: 'Vertex re-engagement', status: 'Queued', preview: 'Reference the old partnership thread and new GTM focus.' }
]

export const analyticsHighlights = [
  { id: 'h1', label: 'Reply rate', value: '31.4%', delta: '+4.1%' },
  { id: 'h2', label: 'Booked meetings', value: '42', delta: '+8' },
  { id: 'h3', label: 'Positive responses', value: '118', delta: '+17' }
]

export const missions = [
  { id: 'm1', title: 'Q2 Outreach', description: 'High-value ICP outreach', status: 'Active' },
  { id: 'm2', title: 'Re-engage', description: 'Follow-up with churn-risk accounts', status: 'Paused' }
]

export const leads = [
  {
    id: 'l1',
    name: 'Ava Roberts',
    company: 'Nimbus',
    industry: 'SaaS / RevOps',
    decisionMaker: 'Ava Roberts, Head of Growth',
    fitScore: 94,
    outreachStatus: 'Qualified',
    lastUpdated: '2026-05-18T08:45:00Z',
    qualificationReasoning: 'Strong expansion signal from recent hiring, clear ownership of growth strategy, and a product motion that matches the current outbound stack.',
    keyBusinessSignals: ['Series B funding', '3x growth hiring in 90 days', 'New outbound tooling rollout', 'Enterprise ICP alignment'],
    role: 'Head of Growth',
    stage: 'Discovery'
  },
  {
    id: 'l2',
    name: 'Ethan Clarke',
    company: 'Aurora',
    industry: 'Fintech',
    decisionMaker: 'Ethan Clarke, VP Sales',
    fitScore: 87,
    outreachStatus: 'In conversation',
    lastUpdated: '2026-05-18T11:15:00Z',
    qualificationReasoning: 'The sales org is scaling ahead of a territory expansion, and the account shows enough spend capacity to justify a tailored enterprise motion.',
    keyBusinessSignals: ['Territory expansion announced', 'Net-new SDR team hired', 'Competitor replacement opportunity', 'Active outbound motion'],
    role: 'VP Sales',
    stage: 'Qualified'
  },
  {
    id: 'l3',
    name: 'Maya Chen',
    company: 'Vertex',
    industry: 'Developer Tools',
    decisionMaker: 'Maya Chen, CTO',
    fitScore: 78,
    outreachStatus: 'Researching',
    lastUpdated: '2026-05-17T22:30:00Z',
    qualificationReasoning: 'Technical leadership is present, but the company is earlier in buying intent. The score reflects high technical fit and a moderate timing signal.',
    keyBusinessSignals: ['Platform migration project', 'Open architecture stack', 'Recent engineering leadership hire', 'Mid-market expansion'],
    role: 'CTO',
    stage: 'Demo'
  }
]

export const searchIndex = [
  { id: 's1', title: 'Open Pipeline', subtitle: 'View pipeline overview' },
  { id: 's2', title: 'Missions', subtitle: 'Manage outreach sequences' },
  { id: 's3', title: 'Leads', subtitle: 'Browse lead records' },
  { id: 's4', title: 'Analytics', subtitle: 'Review performance trends' },
  ...leads.map(l => ({ id: l.id, title: l.name, subtitle: l.company }))
]

export function getLead(id: string) {
  return leads.find(l => l.id === id)
}
