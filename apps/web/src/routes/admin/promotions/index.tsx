import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Eye, FileStack, ListOrdered, Pencil, Plus, Printer, Trash2, UserRoundSearch } from 'lucide-react'
import { APPLICATION_TYPES, PROMOTION_KINDS, PROMOTION_LEVELS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date } from '#/lib/format'
import { assessorSchema, promotionApplicationSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useJobs } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StatusTabs } from '#/components/admin/status-tabs'
import { LevelBadge } from '#/components/promotions/level-badge'

const TABS = ['applications', 'assessors', 'steps'] as const

export const Route = createFileRoute('/admin/promotions/')({
  validateSearch: z.object({ tab: z.enum(TABS).optional(), level: z.string().optional() }),
  component: PromotionsPage,
})

type Row = Record<string, any> & { id: number }

function PromotionsPage() {
  const { tab = 'applications', level } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <>
      <PageHeader
        eyebrow="Modules"
        title="Appointment & Promotion"
        description="Applications for promotion, appointment and contract renewal as they move from department to faculty, college and the Directorate of HR, through assessment to approval."
      />
      <Tabs value={tab} onValueChange={(t) => navigate({ search: { tab: t as (typeof TABS)[number] } })}>
        <TabsList className="mb-5">
          <TabsTrigger value="applications"><FileStack /> Applications</TabsTrigger>
          <TabsTrigger value="assessors"><UserRoundSearch /> Assessors</TabsTrigger>
          <TabsTrigger value="steps"><ListOrdered /> HR processing steps</TabsTrigger>
        </TabsList>
        <TabsContent value="applications"><Applications level={level} onLevel={(l) => navigate({ search: { tab: 'applications', level: l } })} /></TabsContent>
        <TabsContent value="assessors"><Assessors /></TabsContent>
        <TabsContent value="steps"><Steps /></TabsContent>
      </Tabs>
    </>
  )
}

const LEVEL_TABS = [
  ...[4, 5, 6, 0, 1, 2, 3, 7, 8].map((l) => ({ value: String(l), label: PROMOTION_LEVELS[l]! })),
  { value: 'returned', label: 'Returned' },
]

function Applications({ level, onLevel }: { level?: string; onLevel: (l?: string) => void }) {
  const navigate = useNavigate()
  const canEdit = useCan('promotions', 'edit')
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [kind, setKind] = useState('')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['promotions', { level, q, type, kind, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/promotions/applications', { level, q, type, kind, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <NewApplicationDialog open={creating} onClose={() => setCreating(false)} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StatusTabs value={level ?? ''} onChange={(l) => (setPage(1), onLevel(l || undefined))} options={LEVEL_TABS} counts={data?.counts} />
        {canEdit && (
          <Button className="mb-4" onClick={() => setCreating(true)}>
            <Plus /> Record application
          </Button>
        )}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number or position…" />
        <FilterSelect label="Type" value={type} onChange={(v) => (setType(v), setPage(1))} options={Object.entries(APPLICATION_TYPES).map(([value, label]) => ({ value, label }))} />
        <FilterSelect label="Promotion kind" value={kind} onChange={(v) => (setKind(v), setPage(1))} options={PROMOTION_KINDS.map((k) => ({ value: k, label: k.charAt(0) + k.slice(1).toLowerCase() }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        rowLink={(r) => ({ to: '/admin/promotions/$id', params: { id: String(r.id) } })}
        empty={<EmptyState icon={FileStack} title="No applications here" />}
        columns={[
          { header: 'Applicant', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.unitName} link={false} /> },
          {
            header: 'Applying for',
            cell: (r) => (
              <span className="flex max-w-72 items-center gap-1.5 text-xs">
                <span className="truncate text-muted-foreground">{r.currentTitle ?? '—'}</span>
                <ArrowRight className="size-3.5 shrink-0 text-secondary-foreground" />
                <span className="truncate font-semibold text-slate-800">{r.positionTitle ?? '—'}</span>
              </span>
            ),
          },
          {
            header: 'Type',
            cell: (r) => (
              <span className="flex flex-col gap-1">
                <Badge tone={r.type === 0 ? 'brand' : 'neutral'} dot={false}>{APPLICATION_TYPES[r.type] ?? 'Promotion'}</Badge>
                {r.type === 0 && r.promoComments && <span className="text-[0.7rem] text-muted-foreground">{r.promoComments.replace(' PROMOTION', '').toLowerCase()}</span>}
              </span>
            ),
          },
          { header: 'Submitted', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.submittedAt)}</span> },
          {
            header: 'Stage',
            cell: (r) => (
              <span className="flex max-w-56 flex-col gap-1">
                <LevelBadge level={Number(r.promoStatus)} stageStatus={Number(r.stageStatus)} />
                <span className="truncate text-[0.7rem] text-muted-foreground">{r.hrStepLabel ?? r.stage}</span>
              </span>
            ),
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Open application', icon: Eye, onSelect: () => navigate({ to: '/admin/promotions/$id', params: { id: String(r.id) } }) },
                  { label: 'Print application', icon: Printer, onSelect: () => window.open(`/print/promotion/${r.id}`, '_blank') },
                ]}
              />
            ),
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function NewApplicationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  type In = z.input<typeof promotionApplicationSchema>
  const navigate = useNavigate()
  const jobs = useJobs()
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<In>({ resolver: zodResolver(promotionApplicationSchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ staffNo: '' as unknown as number, type: 0, positionId: '' as unknown as number, promoComments: 'REGULAR PROMOTION', appLetter: '', applyForm: '' }))
  }, [open, reset])
  const save = useSave((v: In) => api.post<{ id: number }>('/promotions/applications', v), {
    invalidate: ['promotions'],
    success: 'Application recorded',
    onDone: (r) => (onClose(), navigate({ to: '/admin/promotions/$id', params: { id: String(r.id) } })),
    onError: setError,
  })
  const type = Number(watch('type'))
  return (
    <FormDialog wide open={open} onOpenChange={(o) => !o && onClose()} title="Record an application" description="For applications received on paper. It starts at the Directorate of HR." onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Application type" required>
        <NativeSelect {...register('type')}>
          {Object.entries(APPLICATION_TYPES).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </NativeSelect>
      </Field>
      {type === 0 ? (
        <Field label="Kind of promotion">
          <NativeSelect {...register('promoComments')}>
            {PROMOTION_KINDS.map((k) => (
              <option key={k} value={k}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>
            ))}
          </NativeSelect>
        </Field>
      ) : (
        <div />
      )}
      <Field label={type === 1 ? 'Position held' : 'Position applied for'} required error={errors.positionId?.message} className="sm:col-span-2">
        <Controller control={control} name="positionId" render={({ field }) => <Combobox options={jobs.data} loading={jobs.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.positionId)} placeholder="Choose designation…" />} />
      </Field>
      <Field label="Application letter (PDF)" className="sm:col-span-2">
        <Controller control={control} name="appLetter" render={({ field }) => <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Application letter' : null }} onChange={(f) => field.onChange(f.url ?? '')} />} />
      </Field>
      <Field label="Application form (PDF)" className="sm:col-span-2">
        <Controller control={control} name="applyForm" render={({ field }) => <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Application form' : null }} onChange={(f) => field.onChange(f.url ?? '')} />} />
      </Field>
    </FormDialog>
  )
}

function Assessors() {
  type In = z.input<typeof assessorSchema>
  const canEdit = useCan('promotions', 'edit')
  const canManage = useCan('promotions', 'manage')
  const { confirm, dialog } = useConfirm()
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['assessors'], queryFn: () => api.get<Array<Row>>('/promotions/assessors') })
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(assessorSchema) })
  useEffect(() => {
    if (!form) return
    setError(null)
    const r = form.row
    reset({ fname: r?.fname ?? '', lname: r?.lname ?? '', email: r?.email ?? '', phoneNo: r?.phoneNo ?? '', institution: r?.institution ?? '', eduLevel: r?.eduLevel ?? '', specialArea: r?.specialArea ?? '', address: r?.address ?? '', city: r?.city ?? '', country: r?.country ?? 'Ghana', active: r ? Boolean(r.active) : true } as In)
  }, [form, reset])
  const save = useSave((v: In) => (form?.row ? api.put(`/promotions/assessors/${form.row.assessorId}`, v) : api.post('/promotions/assessors', v)), {
    invalidate: ['assessors'],
    success: 'Assessor saved',
    onDone: () => setForm(null),
    onError: setError,
  })
  const remove = useSave((id: number) => api.delete<{ deactivated?: boolean }>(`/promotions/assessors/${id}`), {
    invalidate: ['assessors'],
    success: (r) => (r.deactivated ? 'Assessor has assignments — deactivated instead' : 'Assessor deleted'),
  })
  return (
    <>
      {dialog}
      <FormDialog wide open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)} title={form?.row ? 'Edit assessor' : 'New assessor'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
        <Field label="First name" required error={errors.fname?.message}><Input {...register('fname')} /></Field>
        <Field label="Last name" required error={errors.lname?.message}><Input {...register('lname')} /></Field>
        <Field label="Email" error={errors.email?.message}><Input type="email" {...register('email')} /></Field>
        <Field label="Phone"><Input type="tel" {...register('phoneNo')} /></Field>
        <Field label="Institution"><Input {...register('institution')} /></Field>
        <Field label="Rank / level" hint="e.g. Professorship"><Input {...register('eduLevel')} /></Field>
        <Field label="Area of specialization" className="sm:col-span-2"><Input {...register('specialArea')} /></Field>
        <Field label="Address" className="sm:col-span-2"><Input {...register('address')} /></Field>
        <Field label="City"><Input {...register('city')} /></Field>
        <Field label="Country"><Input {...register('country')} /></Field>
        <label className="flex items-center gap-3 sm:col-span-2">
          <Controller control={control} name="active" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
          <span className="text-sm font-medium">Available for assignment</span>
        </label>
      </FormDialog>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">External assessors who review promotion applications.</p>
        {canEdit && (
          <Button onClick={() => setForm({ row: null })}>
            <Plus /> New assessor
          </Button>
        )}
      </div>
      <DataTable
        loading={isLoading}
        rows={data?.map((r) => ({ ...r, id: r.assessorId }) as Row)}
        empty={<EmptyState icon={UserRoundSearch} title="No assessors yet" />}
        columns={[
          { header: 'Assessor', cell: (r) => <span><span className="block font-semibold text-slate-800">{r.fname} {r.lname}</span><span className="text-xs text-muted-foreground">{r.eduLevel}</span></span> },
          { header: 'Institution', cell: (r) => <span className="text-xs">{[r.institution, r.city, r.country].filter(Boolean).join(', ') || '—'}</span> },
          { header: 'Specialization', cell: (r) => <span className="text-xs">{r.specialArea || '—'}</span> },
          { header: 'Contact', cell: (r) => <span className="text-xs">{[r.email, r.phoneNo].filter(Boolean).join(' · ') || '—'}</span> },
          { header: 'Assignments', align: 'right', cell: (r) => <span className="font-mono text-xs">{r.assignments}</span> },
          { header: 'Status', cell: (r) => (r.active ? <Badge tone="success">Available</Badge> : <Badge>Inactive</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete ${r.fname} ${r.lname}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.assessorId) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function Steps() {
  const { data } = useQuery({ queryKey: ['promotion-steps'], queryFn: () => api.get<Array<{ id: string; label: string }>>('/promotions/steps') })
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5">
        <p className="mb-1 font-bold text-slate-900">Approval levels</p>
        <p className="mb-4 text-sm text-muted-foreground">Where an application is, from submission to decision.</p>
        <ol className="space-y-2">
          {Object.entries(PROMOTION_LEVELS).map(([k, v]) => (
            <li key={k} className="flex items-center gap-3 text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-bold text-primary">{k}</span> {v}
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <p className="mb-1 font-bold text-slate-900">HR processing steps</p>
        <p className="mb-4 text-sm text-muted-foreground">Recorded by the Directorate of HR once an application reaches it.</p>
        <ol className="space-y-2">
          {data?.map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary-light font-mono text-xs font-bold text-secondary-light-foreground">{s.id}</span>
              {s.label.charAt(0) + s.label.slice(1).toLowerCase()}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
