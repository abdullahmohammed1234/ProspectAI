export default function Badge({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'green' | 'gray' }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  const color = variant === 'blue' ? 'bg-accent-blue text-black' : variant === 'green' ? 'bg-accent-green text-black' : 'bg-neutral-700'
  return <span className={`${base} ${color}`}>{children}</span>
}
