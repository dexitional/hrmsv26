import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpenCheck, CheckCircle2, Eye, Gift, GraduationCap, Inbox, Pencil, Plus, Printer, Trash2, XCircle } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, daysPhrase } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { studyBenefitSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { DeadlineBadge, EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StatusTabs } from '#/components/admin/status-tabs'
import { StageBadge } from '#/components/study/stage-badge'
import { IntentionDialog } from '#/components/study/intention-dialog'
import { StudyLeaveDialog } from '#/components/study/leave-dialog'
import type { StudyLeaveDraft } from '#/components/study/leave-dialog'

const TABS = ['intentions', 'leaves', 'requests', 'benefits'] as const

export const Route = createFileRoute('/admin/study/')({
  validateSearch: z.object({ tab: z.enum(TABS).optional(), status: z.string().optional() }),
  component: StudyPage,
})

type Row = Record<string, any> & { id: number }

function StudyPage() {
  const { tab = 'intentions', status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const go = (t: (typeof TABS)[number], s?: string) => navigate({ search: { tab: t, status: s } })
  return (
    <>
      <PageHeader
        eyebrow="Modules"
        title="Study Leave"
        description="Intentions to pursue further studies as they move through approval, study leave granted, staff requests and the benefits offered."
      />
      <Tabs value={tab} onValueChange={(t) => go(t as (typeof TABS)[number])}>
        <TabsList className="mb-5">
          <TabsTrigger value="intentions"><BookOpenCheck /> Intentions to study</TabsTrigger>
          <TabsTrigger value="leaves"><GraduationCap /> Study leave</TabsTrigger>
          <TabsTrigger value="requests"><Inbox /> Study leave requests</TabsTrigger>
          <TabsTrigger value="benefits"><Gift /> Benefits</TabsTrigger>
        </TabsList>
        <TabsContent value="intentions"><Intentions status={status} onStatus={(s) => go('intentions', s)} /></TabsContent>
        <TabsContent value="leaves"><Leaves status={status} onStatus={(s) => go('leaves', s)} /></TabsContent>
        <TabsContent value="requests"><Requests status={status} onStatus={(s) => go('requests', s)} /></TabsContent>
        <TabsContent value="benefits"><Benefits /></TabsContent>
      </Tabs>
    </>
  )
}

const STAGE_TABS = [
  { value: '4', label: 'Awaiting HR' },
  { value: '1', label: 'At head of unit' },
  { value: '2', label: 'At dean / director' },
  { value: '3', label: 'At provost' },
  { value: '5', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: '7', label: 'Closed (legacy)' },
]

function Intentions({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const navigate = useNavigate()
  const canEdit = useCan('study', 'edit')
  const canDelete = useCan('study', 'manage')
  const { confirm, dialog } = useConfirm()
  const [editing, setEditing] = useState<Row | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const remove = useSave((id: number) => api.delete(`/study/intentions/${id}`), { invalidate: ['study-intentions'], success: 'Application deleted' })
  const { data, isLoading } = useQuery({
    queryKey: ['study-intentions', { status, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/study/intentions', { stage: status, q, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      {dialog}
      <IntentionDialog intention={editing} onClose={() => setEditing(null)} />
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Applications filled in on the staff portal. Each is recommended by the head of unit, the dean or director and the provost before HR makes the final decision.
      </p>
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={STAGE_TABS} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number, programme or institution…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        rowLink={(r) => ({ to: '/admin/study/intention/$id', params: { id: String(r.id) } })}
        empty={<EmptyState icon={BookOpenCheck} title="No applications here" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.presentRank} link={false} /> },
          {
            header: 'Intended programme',
            cell: (r) => (
              <span className="block max-w-72">
                <span className="line-clamp-1 font-semibold text-slate-800">{r.intProg || '—'}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{r.studyPlace}</span>
              </span>
            ),
          },
          { header: 'Mode', cell: (r) => <Badge dot={false}>{statusLabel(r.studyMode ?? '—')}</Badge> },
          { header: 'Commences', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.dateCommence)}</span> },
          { header: 'Duration', cell: (r) => <span className="text-xs">{r.progDuration || '—'}</span> },
          { header: 'Submitted', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.subDate ?? r.activityDate)}</span> },
          { header: 'Stage', cell: (r) => <StageBadge appstatus={Number(r.appstatus)} stageStatus={Number(r.stageStatus)} /> },
          { header: '', cell: (r) => (r.leaveId ? <Badge tone="success" dot={false}>Leave granted</Badge> : null) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Open application', icon: Eye, onSelect: () => navigate({ to: '/admin/study/intention/$id', params: { id: String(r.id) } }) },
                  { label: 'Print form', icon: Printer, onSelect: () => window.open(`/print/study-intention/${r.id}`, '_blank') },
                  { label: 'Edit form', icon: Pencil, hidden: !canEdit, onSelect: () => setEditing(r) },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canDelete,
                    onSelect: () =>
                      confirm({
                        title: 'Delete this application?',
                        description: r.leaveId
                          ? 'Study leave was granted from this application. Delete that study leave record first.'
                          : `The intention to study of ${r.fullName} and its approval trail are removed for good.`,
                        confirmLabel: 'Delete',
                        danger: true,
                        onConfirm: () => remove.mutateAsync(r.id),
                      }),
                  },
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

const LEAVE_TABS = [
  { value: 'on_leave', label: 'On study leave' },
  { value: 'ending', label: 'Ending ≤ 60 days' },
  { value: 'overdue', label: 'Past end date' },
  { value: 'bonded', label: 'Serving bond' },
  { value: 'resumed', label: 'Resumed' },
]

function Leaves({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const canEdit = useCan('study', 'edit')
  const canManage = useCan('study', 'manage')
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<StudyLeaveDraft | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['study-leaves', { status, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/study/leaves', { status, q, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/study/leaves/${id}`), { invalidate: ['study-leaves'], success: 'Study leave deleted' })
  const edit = async (r: Row) => setForm({ ...(await api.get<StudyLeaveDraft>(`/study/leaves/${r.id}`)), id: r.id })
  return (
    <>
      {dialog}
      <StudyLeaveDialog value={form} onClose={() => setForm(null)} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={LEAVE_TABS} counts={data?.counts} />
        {canEdit && (
          <Button className="mb-4" onClick={() => setForm({})}>
            <Plus /> Grant study leave
          </Button>
        )}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number, programme or institution…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={GraduationCap} title="No study leave records" description="Grant study leave from an approved intention to study, or record one here." />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
          {
            header: 'Programme',
            cell: (r) => (
              <span className="block max-w-64">
                <span className="line-clamp-1 font-semibold text-slate-800">{r.studyProgram}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{[r.studyInstitute, r.studyCountry].filter(Boolean).join(', ')}</span>
              </span>
            ),
          },
          { header: 'Type', cell: (r) => <span className="text-xs">{r.studyType === 'PART' ? 'Part-time' : 'Full-time'} · {statusLabel(r.studyNature ?? '')}</span> },
          { header: 'Period', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.studyStart)} – {date(r.studyEnd)}</span> },
          {
            header: 'Remarks',
            cell: (r) =>
              r.status === 'RESUMED' ? (
                r.bondDaysLeft !== null && Number(r.bondDaysLeft) >= 0 ? <Badge tone="info">Bond ends {daysPhrase(r.bondDaysLeft)}</Badge> : <Badge tone="success">Resumed</Badge>
              ) : ['ON_LEAVE', 'EXTENDED'].includes(r.status) ? (
                <DeadlineBadge daysLeft={r.daysToEnd} alertDays={60} doneLabel="Due back" runningLabel={`Ends ${daysPhrase(r.daysToEnd)}`} />
              ) : (
                <StatusBadge status={r.status} />
              ),
          },
          { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Print record', icon: Printer, onSelect: () => window.open(`/print/study-leave/${r.id}`, '_blank') },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => void edit(r) },
                  'separator',
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this study leave record?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
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

function Requests({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const canEdit = useCan('study', 'edit')
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['study-requests', { status, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/study/requests', { status, q, page }),
    placeholderData: keepPreviousData,
  })
  const decide = useSave(({ id, decision }: { id: number; decision: 'approve' | 'reject' }) => api.post(`/study/requests/${id}/decide`, { decision }), {
    invalidate: ['study-requests', 'study-leaves'],
    success: 'Request decided',
  })
  return (
    <>
      {dialog}
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">Study leave requests submitted by staff. Approving one grants the study leave with the details given.</p>
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Inbox} title="No study leave requests" description="Requests submitted on the staff portal appear here." />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
          { header: 'Programme', cell: (r) => <span className="block max-w-64 text-sm">{r.studyProgram} <span className="block text-xs text-muted-foreground">{r.studyInstitute}</span></span> },
          { header: 'Period', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.studyStart)} – {date(r.studyEnd)}</span> },
          { header: 'Applied', cell: (r) => <span className="text-xs">{date(r.applyDate)}</span> },
          { header: 'Status', cell: (r) => <StatusBadge status={r.applyStatus} /> },
          {
            header: '',
            align: 'right',
            cell: (r) =>
              canEdit && r.applyStatus === 'PENDING' ? (
                <span className="flex justify-end gap-1.5">
                  <Button size="sm" onClick={() => confirm({ title: `Approve study leave for ${r.fullName}?`, description: 'A study leave record is created from the request.', confirmLabel: 'Approve', onConfirm: () => decide.mutateAsync({ id: r.id, decision: 'approve' }) })}>
                    <CheckCircle2 /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => confirm({ title: `Reject ${r.fullName}'s request?`, danger: true, confirmLabel: 'Reject', onConfirm: () => decide.mutateAsync({ id: r.id, decision: 'reject' }) })}>
                    <XCircle /> Reject
                  </Button>
                </span>
              ) : null,
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function Benefits() {
  const canEdit = useCan('study', 'edit')
  const canManage = useCan('study', 'manage')
  const { confirm, dialog } = useConfirm()
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['study-benefits'], queryFn: () => api.get<Array<Row>>('/study/benefits') })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string }>({ resolver: zodResolver(studyBenefitSchema) })
  useEffect(() => {
    if (form) (setError(null), reset({ title: form.row?.title ?? '' }))
  }, [form, reset])
  const save = useSave((v: { title: string }) => (form?.row ? api.put(`/study/benefits/${form.row.id}`, v) : api.post('/study/benefits', v)), {
    invalidate: ['study-benefits'],
    success: 'Benefit saved',
    onDone: () => setForm(null),
    onError: setError,
  })
  const remove = useSave((id: number) => api.delete(`/study/benefits/${id}`), { invalidate: ['study-benefits'], success: 'Benefit deleted' })
  return (
    <>
      {dialog}
      <FormDialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)} title={form?.row ? 'Edit benefit' : 'New benefit'} onSubmit={handleSubmit((v) => save.mutate(v))} busy={save.isPending} error={error}>
        <Field label="Benefit" required error={errors.title?.message} className="sm:col-span-2">
          <Input {...register('title')} />
        </Field>
      </FormDialog>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">Benefits that can be attached to a study leave grant.</p>
        {canEdit && (
          <Button onClick={() => setForm({ row: null })}>
            <Plus /> New benefit
          </Button>
        )}
      </div>
      <DataTable
        loading={isLoading}
        rows={data}
        columns={[
          { header: 'Benefit', cell: (r) => <span className="font-semibold">{r.title}</span> },
          { header: 'Study leaves using it', align: 'right', cell: (r) => <span className="font-mono text-xs">{r.used}</span> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete ${r.title}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}
