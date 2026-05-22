export default function Skeleton({ className = 'h-6 w-full bg-neutral-800 rounded' }: { className?: string }) {
  return <div className={`animate-pulse ${className}`} />
}
