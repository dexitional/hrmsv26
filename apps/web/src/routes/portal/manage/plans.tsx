// Operational Plan manager: the operational plans of the units a head heads
// (and, read-only, of the units below them), and the plan form from the old
// portal: objective, output, outcome, impact, key activity and the review.
// The longer answers are rich text (bold, lists, tables pasted from Word); the
// server cleans the HTML before saving.
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Eye, FilePlus2, Pencil, Target } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { PLAN_RICH_FIELDS, PLAN_STATUSES, operationalPlanSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { RichTextEditor } from '#/components/ui/rich-text-editor'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/portal/manage/plans')({ component: PlansManager })

type R = Record<string, any>
type In = z.input<typeof operationalPlanSchema>
type Data = { year: string; years: Array<string>; units: Array<{ value: number; label: string }>; plans: Array<R> }

const STATUS_TONE: Record<string, 'success' | 'info' | 'warning' | 'danger' | undefined> = {
  Completed: 'success',
  'In Progress': 'info',
  'On Hold': 'warning',
  Defered: 'warning',
  Discontinued: 'danger',
}

function PlansManager() {
  const [year, setYear] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<{ id: number | null } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'manage-plans', year],
    queryFn: () => api.get<Data>('/portal/manage/plans', { year: year || undefined }),
    placeholderData: keepPreviousData,
  })
  const current = data ? data.year === data.years[0] : true
  const plans = (data?.plans ?? []).filter((p) => !q || `${p.unitName} ${p.projectSummary} ${p.ucspLink ?? ''} ${p.responsibility ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      {open && <PlanDialog id={open.id} units={data?.units ?? []} onClose={() => setOpen(null)} />}
      <PageHeader
        eyebrow="Management services"
        title="Operational Plan manager"
        description={`Operational plans for the ${data?.year ?? ''} review year: what your unit will do, how it will be measured, and how it is going.`}
        actions={
          current && (data?.units.length ?? 0) > 0 && (
            <Button onClick={() => setOpen({ id: null })}>
              <FilePlus2 /> Create plan
            </Button>
          )
        }
      />
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Unit, objective, UCSP link or responsibility…" />
        <FilterSelect label="Review year" value={year || data?.year || ''} onChange={setYear} options={(data?.years ?? []).map((y) => ({ value: y, label: y }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={plans}
        empty={<EmptyState icon={Target} title="No operational plans" description={current && data?.units.length ? 'Create your unit’s plan for the year.' : undefined} />}
        columns={[
          { header: 'Unit', cell: (r: R) => <span className="block max-w-48 text-xs font-semibold text-slate-700">{r.unitName}</span> },
          {
            header: 'Objective',
            cell: (r: R) => (
              <span className="block max-w-md">
                <span className="line-clamp-2 text-sm text-slate-800">{r.projectSummary}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{r.performanceIndicators}</span>
              </span>
            ),
          },
          { header: 'UCSP', cell: (r: R) => <span className="font-mono text-xs whitespace-nowrap">{r.ucspLink || '—'}</span> },
          { header: 'Responsibility', cell: (r: R) => <span className="block max-w-40 truncate text-xs">{r.responsibility || '—'}</span> },
          { header: 'Status', cell: (r: R) => (r.rStatus ? <Badge tone={STATUS_TONE[r.rStatus]}>{r.rStatus}</Badge> : <span className="text-xs text-muted-foreground">Not reviewed</span>) },
          { header: 'Added', cell: (r: R) => <span className="text-xs whitespace-nowrap text-slate-600">{date(r.activityDate)}</span> },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <Button size="sm" variant="outline" onClick={() => setOpen({ id: r.id })}>
                {r.editable ? <Pencil /> : <Eye />} {r.editable ? 'Edit / review' : 'View'}
              </Button>
            ),
          },
        ]}
      />
    </>
  )
}

const RICH = PLAN_RICH_FIELDS

/** Saved rich text, read-only (cleaned on the server); older plans hold plain text. */
function RichView({ html }: { html: unknown }) {
  const v = String(html ?? '').trim()
  if (!v) return <p className="rounded-xl border border-dashed px-3.5 py-2.5 text-sm text-muted-foreground">—</p>
  return /<[a-z][\s\S]*>/i.test(v) ? (
    <div
      className="rich-text rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: v }}
    />
  ) : (
    <p className="rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm whitespace-pre-line text-slate-800">{v}</p>
  )
}

const Section = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="border-b border-dashed pt-2 pb-1 sm:col-span-2">
    <p className="eyebrow">{children}</p>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
)

const EMPTY: In = {
  unitId: '' as never,
  projectSummary: '',
  performanceIndicators: '',
  ucspLink: '',
  bEstimated: '',
  bActual: '',
  riskAssump: '',
  responsibility: '',
  tEstimated: '',
  tActual: '',
  sourcesMeans: '',
  outputSummary: '',
  outputIndicators: '',
  outcomeSummary: '',
  outcomeIndicators: '',
  impactSummary: '',
  impactIndicators: '',
  activitySummary: '',
  activityIndicators: '',
  activityBEstimated: '',
  activityBActual: '',
  activityTEstimated: '',
  activityTActual: '',
  opportunities: '',
  challenges: '',
  actionTaken: '',
  remarks: '',
  rStatus: '' as never,
}

function PlanDialog({ id, units, onClose }: { id: number | null; units: Array<{ value: number; label: string }>; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const plan = useQuery({ queryKey: ['portal', 'manage-plan', id], queryFn: () => api.get<R>(`/portal/manage/plans/${id}`), enabled: id !== null })
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(operationalPlanSchema), defaultValues: { ...EMPTY, unitId: (units.length === 1 ? units[0]!.value : '') as never } })
  useEffect(() => {
    const p = plan.data
    if (!p) return
    reset(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, p[k] ?? ''])) as In)
  }, [plan.data, reset])
  const readOnly = id !== null && plan.data && !plan.data.editable
  const save = useSave((v: In) => (id ? api.put(`/portal/manage/plans/${id}`, v) : api.post('/portal/manage/plans', v)), {
    invalidate: ['portal'],
    success: id ? 'Plan updated' : 'Operational plan created',
    onDone: onClose,
    onError: setError,
  })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  const text = (name: keyof In, label: string, required = false, rows = 2) => (
    <Field label={label} required={required && !readOnly} error={err(name)} className="sm:col-span-2">
      {!(RICH as ReadonlyArray<string>).includes(name) ? (
        <Textarea rows={rows} disabled={Boolean(readOnly)} {...register(name)} />
      ) : readOnly ? (
        <RichView html={plan.data?.[name]} />
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field }) => <RichTextEditor value={field.value as string} onChange={field.onChange} minHeight={rows * 32 + 24} invalid={Boolean(err(name))} placeholder="Type here, or paste from Word…" />}
        />
      )}
    </Field>
  )
  const short = (name: keyof In, label: string, required = false) => (
    <Field label={label} required={required && !readOnly} error={err(name)}>
      <Input disabled={Boolean(readOnly)} {...register(name)} />
    </Field>
  )
  return (
    <FormDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={id === null ? 'Create operational plan' : readOnly ? 'Operational plan' : 'Edit and review operational plan'}
      description={plan.data ? `${plan.data.unitName} · ${plan.data.reviewYear} · by ${plan.data.fullName ?? plan.data.staffNo}` : 'For the review year, as on the University’s operational plan form.'}
      submitLabel={id === null ? 'Create plan' : 'Save changes'}
      busy={save.isPending}
      error={error}
      wide
      onSubmit={readOnly ? (e) => (e.preventDefault(), onClose()) : handleSubmit((v) => save.mutate(v))}
    >
      {id === null && (
        <Field label="Unit" required error={err('unitId')} className="sm:col-span-2">
          <NativeSelect {...register('unitId')}>
            <option value="">Choose…</option>
            {units.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Section>Objectives</Section>
      {text('projectSummary', 'Project summary', true, 3)}
      {text('performanceIndicators', 'Performance indicators', true)}
      {short('ucspLink', 'Link to UCSP', true)}
      {short('responsibility', 'Responsibility')}
      {short('bEstimated', 'Budget estimated')}
      {short('bActual', 'Budget actual')}
      {short('tEstimated', 'Target estimated')}
      {short('tActual', 'Target actual')}
      {text('riskAssump', 'Risks and assumptions')}
      {text('sourcesMeans', 'Sources and means of verification', false, 1)}

      <Section>Output</Section>
      {text('outputSummary', 'Project summary', true)}
      {text('outputIndicators', 'Performance indicators', true)}
      <Section>Outcome</Section>
      {text('outcomeSummary', 'Project summary', true)}
      {text('outcomeIndicators', 'Performance indicators', true)}
      <Section>Impact</Section>
      {text('impactSummary', 'Project summary', true)}
      {text('impactIndicators', 'Performance indicators', true)}

      <Section>Activity</Section>
      {text('activitySummary', 'Project summary (activity)')}
      {text('activityIndicators', 'Performance indicators (activity)')}
      {short('activityBEstimated', 'Budget estimated')}
      {short('activityBActual', 'Budget actual')}
      {short('activityTEstimated', 'Target estimated')}
      {short('activityTActual', 'Target actual')}

      <Section hint="Update as the year goes on.">Review</Section>
      <Field label="Status" error={err('rStatus')}>
        <NativeSelect disabled={Boolean(readOnly)} {...register('rStatus')}>
          <option value="">Not reviewed yet</option>
          {PLAN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <span className="max-sm:hidden" />
      {text('opportunities', 'Opportunities')}
      {text('challenges', 'Challenges')}
      {text('actionTaken', 'Action taken')}
      {text('remarks', 'Remarks')}
    </FormDialog>
  )
}
