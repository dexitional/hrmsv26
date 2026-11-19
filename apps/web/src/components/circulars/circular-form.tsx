// Draft or edit a circular: the notice itself, who it is for (with a live
// count of the audience) and how it goes out. Publishing happens from the
// circular's page, after a review.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Globe, Loader2, Mail, MessageSquareText, Save, Users } from 'lucide-react'
import { cn } from '@hrms/ui'
import { STAFF_GROUPS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { circularSmsText } from '#/lib/circular-sms'
import { num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { CIRCULAR_SMS_MAX, circularSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { MultiCombobox } from '#/components/admin/combobox'
import { FileField } from '#/components/admin/file-upload'
import { Field, FormActions, FormSection } from '#/components/admin/form'
import { useJobs, useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { SmsBubble, smsParts } from './shared'
import type { Audience, AudienceSummary } from './shared'

type In = z.input<typeof circularSchema>

const v = (x: unknown) => (x === null || x === undefined ? '' : String(x))
const csvIds = (x: unknown) =>
  String(x ?? '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)

function useDebounced<T>(value: T, ms = 400) {
  const [out, setOut] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setOut(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return out
}

export function CircularForm({ circular }: { circular?: Record<string, any> }) {
  const navigate = useNavigate()
  const units = useUnits()
  const jobs = useJobs()
  const a = circular?.audience as Audience | undefined
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<In>({
    resolver: zodResolver(circularSchema),
    defaultValues: {
      letterNo: v(circular?.letterNo),
      subject: v(circular?.subject),
      message: v(circular?.message),
      smsNote: v(circular?.smsNote),
      attachment: v(circular?.attachment),
      attachmentName: v(circular?.attachmentName),
      staffGroups: a?.staffGroups ?? [],
      unitIds: a?.unitIds ?? [],
      includeSubunits: a?.includeSubunits ?? true,
      headsOnly: a?.headsOnly ?? false,
      jobIds: a?.jobIds ?? csvIds(circular?.catJobId),
      staffNos: a?.staffNos ?? [],
      sendSms: circular ? Number(circular.sendSms) === 1 : true,
      sendEmail: circular ? Number(circular.sendEmail) === 1 : true,
      sendPortal: circular ? Number(circular.sendPortal) === 1 : true,
    },
  })
  const [staffText, setStaffText] = useState((a?.staffNos ?? []).join(', '))

  const save = useSave((data: In) => (circular ? api.put<{ id: number }>(`/circulars/${circular.id}`, data) : api.post<{ id: number }>('/circulars', data)), {
    invalidate: ['circulars'],
    success: circular ? 'Draft saved' : 'Circular saved as a draft',
    onDone: (r) => navigate({ to: '/admin/circulars/$id', params: { id: String(r.id) } }),
  })

  // Live audience count.
  const w = watch()
  const audience = useDebounced(
    useMemo(
      () => ({ staffGroups: w.staffGroups ?? [], unitIds: w.unitIds ?? [], includeSubunits: w.includeSubunits ?? true, headsOnly: w.headsOnly ?? false, jobIds: w.jobIds ?? [], staffNos: w.staffNos ?? [] }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify([w.staffGroups, w.unitIds, w.includeSubunits, w.headsOnly, w.jobIds, w.staffNos])],
    ),
  )
  const reach = useQuery({
    queryKey: ['circular-audience', audience],
    queryFn: () => api.post<AudienceSummary>('/circulars/audience', audience),
    staleTime: 60_000,
  })

  const sms = circularSmsText(
    { letterNo: v(w.letterNo) || null, subject: v(w.subject) || 'Subject', message: v(w.message) || null, smsNote: v(w.smsNote) || null, hasAttachment: Boolean(w.attachment) },
    { email: Boolean(w.sendEmail), portal: Boolean(w.sendPortal) },
  )
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  const groups = (w.staffGroups ?? []) as Array<string>

  return (
    <form onSubmit={handleSubmit((d) => save.mutate(d))} noValidate className="rounded-2xl border bg-white p-6 max-md:p-4">
      <FormSection index={1} title="The circular" description="What staff will read on the portal and in their email. Attach the signed circular as a PDF.">
        <Field label="Reference / letter number">
          <Input {...register('letterNo')} className="font-mono" placeholder="DHR/ONC/0.2/V.3/28" />
        </Field>
        <Field label="Subject" required error={err('subject')}>
          <Input {...register('subject')} placeholder="Christmas and New Year break" />
        </Field>
        <Field label="Message" className="sm:col-span-2" error={err('message')} hint="Leave a blank line between paragraphs. Web links become clickable in the email.">
          <Textarea rows={8} {...register('message')} placeholder="The University breaks on …" />
        </Field>
        <Field label="Circular document (PDF)" className="sm:col-span-2" hint="Sent as an email attachment and opened from the staff portal.">
          <Controller
            control={control}
            name="attachment"
            render={({ field }) => (
              <FileField
                accept=".pdf,application/pdf"
                endpoint="/files/pdf"
                value={{ url: (field.value as string) || null, name: (w.attachmentName as string) || (field.value ? 'Circular.pdf' : null) }}
                onChange={(f) => (field.onChange(f.url ?? ''), setValue('attachmentName', f.name ?? ''))}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection index={2} title="Who it is for" description="Nothing chosen sends to all active staff. Categories, units and designations narrow it together; named staff are always added.">
        <Field label="Staff categories" className="sm:col-span-2">
          <Controller
            control={control}
            name="staffGroups"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {STAFF_GROUPS.map((g) => {
                  const on = groups.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(on ? groups.filter((x) => x !== g) : [...groups, g])}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                        on ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong',
                      )}
                    >
                      {g} · {GROUP_LABELS[g]}
                    </button>
                  )
                })}
                {groups.length === 0 && <span className="self-center text-xs text-muted-foreground">All categories</span>}
              </div>
            )}
          />
        </Field>
        <Field label="Units" className="sm:col-span-2">
          <Controller control={control} name="unitIds" render={({ field }) => <MultiCombobox options={units.data} loading={units.isLoading} value={(field.value as Array<number>) ?? []} onChange={field.onChange} placeholder="All units" />} />
        </Field>
        <label className="flex items-start gap-3 rounded-xl border p-3">
          <Controller control={control} name="includeSubunits" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
          <span className="text-sm">
            <span className="block font-semibold text-slate-800">Include sub-units</span>
            <span className="text-xs text-muted-foreground">A college or faculty also reaches its departments and sections.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border p-3">
          <Controller control={control} name="headsOnly" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
          <span className="text-sm">
            <span className="block font-semibold text-slate-800">Heads of units only</span>
            <span className="text-xs text-muted-foreground">Only the heads of the chosen units (or of every unit).</span>
          </span>
        </label>
        <Field label="Designations" className="sm:col-span-2">
          <Controller control={control} name="jobIds" render={({ field }) => <MultiCombobox options={jobs.data} loading={jobs.isLoading} value={(field.value as Array<number>) ?? []} onChange={field.onChange} placeholder="All designations" />} />
        </Field>
        <Field label="Named staff" className="sm:col-span-2" hint="Staff numbers separated by commas, spaces or new lines. They receive the circular whatever the filters above.">
          <Textarea
            rows={2}
            value={staffText}
            onChange={(e) => {
              setStaffText(e.target.value)
              const list = [...new Set(e.target.value.split(/[\s,;]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0))]
              setValue('staffNos', list, { shouldDirty: true })
            }}
            className="font-mono"
            placeholder="8436, 15666"
          />
        </Field>
        <AudiencePreview summary={reach.data} loading={reach.isFetching} />
      </FormSection>

      <FormSection index={3} title="How it goes out" description="The staff portal keeps a copy in each person's inbox. SMS and email go out when you publish.">
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
          {(
            [
              ['sendPortal', Globe, 'Staff portal', 'Inbox notification with the PDF'],
              ['sendSms', MessageSquareText, 'SMS', 'Short note to every phone'],
              ['sendEmail', Mail, 'Email', 'Full message with the PDF attached'],
            ] as const
          ).map(([name, Icon, label, hint]) => (
            <label key={name} className="flex items-start gap-3 rounded-xl border p-3">
              <Controller control={control} name={name} render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
              <span className="text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Icon className="size-3.5 text-primary" /> {label}
                </span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </span>
            </label>
          ))}
          {err('sendPortal') && <p className="text-xs font-medium text-destructive sm:col-span-3">{err('sendPortal')}</p>}
        </div>
        {w.sendSms && (
          <>
            <Field
              label="SMS note"
              error={err('smsNote')}
              hint={`${v(w.smsNote).length}/${CIRCULAR_SMS_MAX}. Leave blank to use the message.`}
            >
              <Textarea rows={4} maxLength={CIRCULAR_SMS_MAX} {...register('smsNote')} placeholder="The University breaks on 22 December after close of work and resumes on 5 January." />
            </Field>
            <div className="min-w-0">
              <p className="eyebrow mb-2">
                SMS preview · {sms.length} characters · {smsParts(sms.length)} part{smsParts(sms.length) === 1 ? '' : 's'}
              </p>
              <SmsBubble text={sms} />
            </div>
          </>
        )}
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} {circular ? 'Save draft' : 'Save as draft'}
        </Button>
      </FormActions>
    </form>
  )
}

function AudiencePreview({ summary, loading }: { summary?: AudienceSummary; loading: boolean }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary-soft/40 p-4 sm:col-span-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">{loading ? <Loader2 className="size-5 animate-spin" /> : <Users className="size-5" />}</span>
          <span>
            <span className="block text-2xl leading-none font-extrabold text-primary">{summary ? num(summary.count) : '—'}</span>
            <span className="text-xs text-muted-foreground">staff will receive this</span>
          </span>
        </div>
        {summary && summary.count > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
            <span>
              <b className="text-slate-800">{num(summary.withPhone)}</b> with a phone number
            </span>
            <span>
              <b className="text-slate-800">{num(summary.withEmail)}</b> with an email address
            </span>
            {Object.entries(summary.groups).map(([g, n]) => (
              <span key={g}>
                <b className="text-slate-800">{num(n)}</b> {g}
              </span>
            ))}
          </div>
        )}
      </div>
      {summary && summary.sample.length > 0 && (
        <p className="mt-3 truncate text-xs text-muted-foreground">
          Including {summary.sample.map((s) => s.fullName).join(', ')}
          {summary.count > summary.sample.length ? ` and ${num(summary.count - summary.sample.length)} others` : ''}
        </p>
      )}
      {summary && summary.count === 0 && <p className="mt-2 text-xs font-medium text-destructive">No active staff match. Change the choices above.</p>}
    </div>
  )
}
