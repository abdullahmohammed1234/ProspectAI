"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Find ideal accounts',
    description: 'Discover companies that match your offer, niche, and geography in seconds.'
  },
  {
    title: 'Research automatically',
    description: 'Pull funding, hiring, tech stack, and recent activity into one sharp brief.'
  },
  {
    title: 'Identify decision-makers',
    description: 'Map founders, operators, and buyers so outreach lands with the right person.'
  },
  {
    title: 'Draft outreach that fits',
    description: 'Generate highly personalized emails and messages with the right angle, tone, and proof.'
  },
  {
    title: 'Run in the background',
    description: 'ProspectAI keeps working while you handle delivery, calls, or client work.'
  },
  {
    title: 'Track what matters',
    description: 'See who was researched, contacted, and replied without spreadsheet overhead.'
  }
]

const testimonials = [
  {
    quote: 'It feels like hiring a junior growth team overnight. The quality of the research is shockingly good.',
    name: 'Maya Chen',
    role: 'Independent consultant'
  },
  {
    quote: 'I went from sporadic outreach to a real system. ProspectAI turns intent into a daily pipeline.',
    name: 'Jordan Lee',
    role: 'Freelance operator'
  },
  {
    quote: 'The personalization is strong enough that prospects think a human researched every account manually.',
    name: 'Priya Nair',
    role: 'Solo founder'
  }
]

const steps = [
  'Tell ProspectAI who you want to reach and how you sell.',
  'It finds target companies, surfaces the best contacts, and researches the context.',
  'You review personalized outreach drafts and launch a sequence in minutes.'
]

const container = 'mx-auto w-full max-w-7xl px-6 lg:px-8'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
}

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(79,140,255,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.16),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.06),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[linear-gradient(180deg,rgba(11,15,20,0.15),rgba(11,15,20,0.88))]" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-background/70 backdrop-blur-xl">
        <div className={`${container} flex h-20 items-center justify-between`}>
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur">
              <span className="text-sm font-semibold text-white">P</span>
            </div>
            <div>
              <div className="font-display text-lg tracking-tight text-white">ProspectAI</div>
              <div className="text-xs text-white/55">Autonomous prospecting agent</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/72 md:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-white/10 sm:inline-flex">
              Open dashboard
            </Link>
            <Link href="/dashboard" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02] hover:bg-white/90">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-8 sm:pt-12 lg:pt-16">
        <div className={`${container} grid items-start gap-12 lg:gap-20 pb-20 lg:grid-cols-[1.08fr_0.92fr] lg:pb-28`}>
          <motion.div initial="initial" animate="whileInView" variants={{ initial: {}, whileInView: {} }} className="relative z-10">
            <motion.div
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/78 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
              YC-style autonomous prospecting for solo operators
            </motion.div>

            <motion.h1
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="font-display max-w-4xl text-5xl leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
            >
              Autonomous Prospecting for Solo Operators.
            </motion.h1>

            <motion.p
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl"
            >
              ProspectAI finds companies, researches them, identifies decision-makers, and drafts personalized outreach automatically.
            </motion.p>

            <motion.div
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...fadeUp.transition, delay: 0.18 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90">
                Start prospecting
              </Link>
              <a href="#product" className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/86 backdrop-blur transition hover:bg-white/10">
                See product preview
              </a>
            </motion.div>

            <motion.div
              {...fadeUp}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ ...fadeUp.transition, delay: 0.24 }}
              className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {['Company discovery', 'Decision-maker mapping', 'Outreach drafting'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/72 backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            id="product"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative flex items-start justify-end"
          >
            <div className="absolute -inset-8 rounded-[2rem] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(79,140,255,0.28),rgba(16,185,129,0.24),rgba(255,255,255,0.1),rgba(79,140,255,0.28))] opacity-70 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-8 mx-auto w-full max-w-[28rem] lg:max-w-[44rem]">
              <div className="rounded-[1.55rem] border border-white/8 bg-[#0E1420]/80 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-white/42">Pipeline autopilot</div>
                    <div className="mt-1 text-lg font-semibold text-white">Morning run: 128 targets</div>
                  </div>
                  <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Live
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-white/66">
                        <span>Target fit</span>
                        <span>96%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/8">
                        <div className="h-2 w-[96%] rounded-full bg-[linear-gradient(90deg,#4F8CFF,#10B981)]" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Decision-maker</div>
                      <div className="mt-1 text-sm font-medium text-white">Avery Stone</div>
                      <div className="mt-1 text-xs text-white/60">Founder · Acme Co.</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Company</div>
                      <div className="mt-1 text-sm font-medium text-white">Acme Co.</div>
                      <div className="mt-1 text-xs text-white/60">San Francisco · Series A</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Metric</div>
                      <div className="mt-1 text-sm font-medium text-white">$2.4M</div>
                      <div className="mt-1 text-xs text-white/60">Estimated ARR</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(79,140,255,0.12),rgba(255,255,255,0.03))] p-3">
                      <div className="text-sm font-medium text-white">Draft outreach</div>
                      <div className="mt-2 rounded-lg border border-white/8 bg-[#0A1018] p-3 text-sm text-white/68">
                        Hi Avery — quick note: we saw a lift from a simple outbound sequence without hiring more SDRs.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-sm text-white/66">Tasks</div>
                      <div className="mt-2 flex flex-col gap-2 text-sm text-white/72">
                        <div className="inline-flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Found 128 accounts
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Mapped 46 decision-makers
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Queued 24 drafts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-t border-white/8 py-20 sm:py-24">
        <div className={container}>
          <motion.div {...fadeUp} viewport={{ once: true, amount: 0.35 }} className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.28em] text-white/42">Features</div>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Built for operators who need pipeline without a full team.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                {...fadeUp}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                className="group rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sm font-semibold text-white/88 transition group-hover:scale-105">
                  0{index + 1}
                </div>
                <h3 className="font-display text-xl tracking-[-0.03em] text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/64">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 py-20 sm:py-24">
        <div className={container}>
          <motion.div {...fadeUp} viewport={{ once: true, amount: 0.35 }} className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.28em] text-white/42">How It Works</div>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              One workflow from targeting to outreach.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                {...fadeUp}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
              >
                <div className="text-sm font-medium text-emerald-200">Step 0{index + 1}</div>
                <p className="mt-4 text-base leading-7 text-white/72">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 py-20 sm:py-24">
        <div className={container}>
          <motion.div {...fadeUp} viewport={{ once: true, amount: 0.35 }} className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.28em] text-white/42">Testimonials</div>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Early operators already treat it like a growth hire.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={testimonial.name}
                {...fadeUp}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ ...fadeUp.transition, delay: index * 0.06 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
              >
                <p className="text-base leading-8 text-white/78">“{testimonial.quote}”</p>
                <footer className="mt-6 border-t border-white/8 pt-4">
                  <div className="font-medium text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/52">{testimonial.role}</div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-white/8 py-20 sm:py-24">
        <div className={container}>
          <motion.div {...fadeUp} viewport={{ once: true, amount: 0.35 }} className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.28em] text-white/42">Pricing</div>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Pricing is being finalized for launch.
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mt-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.26em] text-white/42">Launch placeholder</div>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                  Expected plans will likely include a founder tier, a solo operator tier, and a scale tier for teams who want autonomous prospecting across multiple offers.
                </p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90">
                Join the waitlist
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/8 py-10">
        <div className={`${container} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
          <div>
            <div className="font-display text-xl tracking-[-0.03em] text-white">ProspectAI</div>
            <p className="mt-2 text-sm text-white/52">Autonomous prospecting for freelancers, consultants, and founders.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/58">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
