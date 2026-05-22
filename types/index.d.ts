export type Lead = {
  id: string
  name: string
  company: string
  industry: string
  decisionMaker: string
  fitScore: number
  outreachStatus: 'New' | 'Researching' | 'Qualified' | 'In conversation' | 'Archived'
  lastUpdated: string
  qualificationReasoning: string
  keyBusinessSignals: string[]
  role?: string
  stage?: string
}
