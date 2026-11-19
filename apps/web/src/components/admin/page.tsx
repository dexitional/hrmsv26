import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Inbox } from 'lucide-react'
import { cn } from '@hrms/ui'
import { Badge } from '#/components/ui/badge'
import { STATUS_TONES, statusLabel } from '#/lib/labels'
import type { Tone } from '#/lib/labels'

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  back,
  meta,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  back?: { to: string; label: string; params?: Record<string, string> }
  meta?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      {back && (
        <Link
          to={back.to}
          params={back.params as never}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-3 max-sm:grid-cols-1">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900 lg:text-[1.75rem]">
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function StatusBadge({ status, label, tone }: { status: string | null | undefined; label?: string; tone?: Tone }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  return <Badge tone={tone ?? STATUS_TONES[status] ?? 'neutral'}>{label ?? statusLabel(status)}</Badge>
}

/** Age with the retirement colour: green under 59, amber at 59, red from 60. */
export function AgeBadge({ age }: { age: number | null | undefined }) {
  if (age === null || age === undefined) return <span className="text-muted-foreground">—</span>
  const tone: Tone = age >= 60 ? 'danger' : age >= 59 ? 'warning' : 'success'
  return (
    <Badge tone={tone} className="font-mono tabular-nums">
      {age} yrs
    </Badge>
  )
}

/** "Expired", "Ends in 30 days", "Running" — for anything with a deadline. */
export function DeadlineBadge({
  daysLeft,
  alertDays = 90,
  doneLabel = 'Expired',
  runningLabel,
}: {
  daysLeft: number | null | undefined
  alertDays?: number
  doneLabel?: string
  runningLabel?: string
}) {
  if (daysLeft === null || daysLeft === undefined) return <span className="text-muted-foreground">—</span>
  const d = Number(daysLeft)
  if (d < 0)
    return (
      <Badge tone="danger">
        {doneLabel} · {Math.abs(d)}d ago
      </Badge>
    )
  if (d <= alertDays) return <Badge tone="warning">{d === 0 ? 'Today' : `${d} day${d === 1 ? '' : 's'} left`}</Badge>
  return <Badge tone="success">{runningLabel ?? `${d} days left`}</Badge>
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: typeof Inbox
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-light text-secondary-light-foreground">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function DetailList({ items, columns = 2 }: { items: Array<[string, React.ReactNode]>; columns?: 1 | 2 | 3 }) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="eyebrow">{label}</dt>
          <dd className="mt-1 text-sm break-words text-slate-800">
            {value === null || value === undefined || value === '' ? '—' : value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// UCC publishes staff photos by staff number.
export function uccPhotoUrl(staffNo?: string | number | null) {
  const tag = String(staffNo ?? '').trim()
  return tag ? `https://cdn.ucc.edu.gh/photos/?tag=${encodeURIComponent(tag)}` : null
}

/** A person's photo: their uploaded one, else their UCC staff photo, else initials. */
export function Avatar({
  name,
  className,
  photoUrl,
  staffNo,
}: {
  name: string
  className?: string
  photoUrl?: string | null
  staffNo?: string | number | null
}) {
  const sources = [photoUrl, uccPhotoUrl(staffNo)].filter((s): s is string => Boolean(s))
  const key = sources.join('|')
  const [failed, setFailed] = useState<{ key: string; count: number }>({ key, count: 0 })
  const tried = failed.key === key ? failed.count : 0
  const src = sources[tried]
  const letters = (name ?? '')
    .replace(/^((Rev\.?|Prof\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|Hon\.?|Alhaji|Naa|\(Mrs\.\))\s*)+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  const initials = (
    (letters[0]?.[0] ?? '') + (letters.length > 1 ? (letters[letters.length - 1]?.[0] ?? '') : '')
  ).toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-[0.7rem] font-bold text-primary',
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailed({ key, count: tried + 1 })}
        />
      ) : (
        initials || '?'
      )}
    </span>
  )
}

/** Avatar + name + staff number, linking to the staff profile. */
export function StaffCell({
  staffNo,
  name,
  sub,
  link = true,
}: {
  staffNo: number | string
  name: string | null | undefined
  sub?: React.ReactNode
  link?: boolean
}) {
  const body = (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={name ?? '?'} staffNo={staffNo} className="size-8" />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-slate-800">{name ?? 'Unknown staff'}</span>
        <span className="block truncate font-mono text-[0.7rem] text-muted-foreground">
          {staffNo}
          {sub ? <span className="font-sans"> · {sub}</span> : null}
        </span>
      </span>
    </span>
  )
  if (!link) return body
  return (
    <Link to="/admin/staff/$staffNo" params={{ staffNo: String(staffNo) }} className="block min-w-0 hover:[&_span]:text-primary">
      {body}
    </Link>
  )
}
