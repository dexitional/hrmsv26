// Small pieces shared by the circular list, form and view pages.
import { Globe, Mail, MessageSquareText } from 'lucide-react'
import { cn } from '@hrms/ui'
import { GROUP_LABELS } from '#/lib/labels'
import type { Tone } from '#/lib/labels'

export const STAGE_LABELS: Record<string, string> = { DRAFT: 'Draft', PUBLISHED: 'Published', ARCHIVED: 'Archived' }
export const STAGE_TONES: Record<string, Tone> = { DRAFT: 'warning', PUBLISHED: 'success', ARCHIVED: 'neutral' }

export interface Audience {
  staffGroups: Array<'SM' | 'SS' | 'JS'>
  unitIds: Array<number>
  includeSubunits: boolean
  headsOnly: boolean
  jobIds: Array<number>
  staffNos: Array<number>
}

export interface AudienceSummary {
  count: number
  withPhone: number
  withEmail: number
  groups: Record<string, number>
  sample: Array<{ staffNo: number; fullName: string; unitName: string | null }>
}

/** GSM-7 SMS parts: 160 characters for one, 153 each when split. */
export const smsParts = (length: number) => (length <= 160 ? 1 : Math.ceil(length / 153))

/** "All staff", "Senior members · 3 units (with sub-units) · heads only" … */
export function audienceLabel(a: Audience, names?: { units?: number; jobs?: number }) {
  const parts: Array<string> = []
  if (a.staffGroups.length) parts.push(a.staffGroups.map((g) => GROUP_LABELS[g] ?? g).join(', '))
  const units = names?.units ?? a.unitIds.length
  if (units) parts.push(`${units} unit${units === 1 ? '' : 's'}${a.includeSubunits ? ' (with sub-units)' : ''}`)
  const jobs = names?.jobs ?? a.jobIds.length
  if (jobs) parts.push(`${jobs} designation${jobs === 1 ? '' : 's'}`)
  if (a.headsOnly) parts.push(a.unitIds.length ? 'heads only' : 'all heads of units')
  const base = parts.length ? parts.join(' · ') : a.staffNos.length ? '' : 'All staff'
  const named = a.staffNos.length ? `${a.staffNos.length} named staff` : ''
  return [base, named].filter(Boolean).join(' + ')
}

export function Channels({ sms, email, portal, className }: { sms: boolean; email: boolean; portal: boolean; className?: string }) {
  const items = [
    { on: portal, icon: Globe, label: 'Staff portal' },
    { on: sms, icon: MessageSquareText, label: 'SMS' },
    { on: email, icon: Mail, label: 'Email' },
  ]
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {items.map(({ on, icon: Icon, label }) => (
        <span
          key={label}
          title={`${label}: ${on ? 'yes' : 'no'}`}
          className={cn('flex size-6 items-center justify-center rounded-md', on ? 'bg-primary-soft text-primary' : 'bg-slate-50 text-slate-300')}
        >
          <Icon className="size-3.5" />
        </span>
      ))}
    </span>
  )
}

/** A text message as the phone shows it. */
export function SmsBubble({ text, className }: { text: string; className?: string }) {
  return <div className={cn('max-w-sm rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-800', className)}>{text}</div>
}
