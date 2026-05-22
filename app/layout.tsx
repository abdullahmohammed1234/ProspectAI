import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata = {
  title: 'ProspectAI | Autonomous Prospecting for Solo Operators',
  description: 'ProspectAI finds companies, researches them, identifies decision-makers, and drafts personalized outreach automatically.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-theme="dark">
      <body className={`min-h-screen bg-background text-white antialiased ${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  )
}
