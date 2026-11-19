import { cn } from '@hrms/ui'
import { Skeleton } from '#/components/ui/skeleton'

// Loading layouts shaped like the pages they stand in for.

function Loading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  )
}

export function MetricsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white p-4">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-3 h-6 w-32" />
          <Skeleton className="mt-3 h-2.5 w-24" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ lines = 4, chart = false, className }: { lines?: number; chart?: boolean; className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-white p-5', className)}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      {chart ? (
        <Skeleton className="mt-5 h-48 rounded-xl" />
      ) : (
        <div className="mt-5 space-y-2.5">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <Loading>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-2/3 max-w-md" />
        <Skeleton className="h-3.5 w-1/2 max-w-sm" />
      </div>
      <MetricsSkeleton />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CardSkeleton chart className="lg:col-span-2" />
        <CardSkeleton lines={6} />
      </div>
    </Loading>
  )
}

export function DashboardSkeleton() {
  return (
    <Loading className="space-y-4">
      <MetricsSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton chart className="lg:col-span-2" />
        <CardSkeleton chart />
      </div>
    </Loading>
  )
}

export function ProfileSkeleton() {
  return (
    <Loading>
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-7 w-2/3 max-w-md" />
          <Skeleton className="h-3.5 w-1/2 max-w-sm" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton lines={8} />
        <CardSkeleton lines={6} className="lg:col-span-2" />
      </div>
    </Loading>
  )
}

export function FormSkeleton() {
  return (
    <Loading className="space-y-4">
      {[0, 1].map((s) => (
        <div key={s} className="rounded-2xl border bg-white p-5">
          <Skeleton className="h-4 w-44" />
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Loading>
  )
}
