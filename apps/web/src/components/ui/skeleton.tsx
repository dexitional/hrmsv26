import { cn } from '@hrms/ui'

// A loading placeholder with a gentle shimmer (see .skeleton in styles.css).
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-lg', className)} />
}
