import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye, Megaphone, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StatusTabs } from '#/components/admin/status-tabs'
import { Channels, STAGE_LABELS, STAGE_TONES, audienceLabel } from '#/components/circulars/shared'

export const Route = createFileRoute('/admin/circulars/')({ component: CircularsPage })

type Row = Record<string, any> & { id: number }

function CircularsPage() {
  const navigate = useNavigate()
  const canEdit = useCan('circulars', 'edit')
  const canManage = useCan('circulars', 'manage')
  const { confirm, dialog } = useConfirm()
  const [stage, setStage] = useState('')
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const years = useQuery({ queryKey: ['circular-years'], queryFn: () => api.get<Array<number>>('/circulars/years'), staleTime: 300_000 })
  const { data, isLoading } = useQuery({
    queryKey: ['circulars', { stage, q, year, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/circulars', { stage, q, year, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/circulars/${id}`), { invalidate: ['circulars'], success: 'Circular deleted' })
  const reset = () => setPage(1)
  return (
    <>
      {dialog}
      <PageHeader
        eyebrow="Modules"
        title="Circulars"
        description="Notices from the Directorate to the university community, sent by SMS, email and the staff portal."
        actions={
          canEdit && (
            <Button asChild>
              <Link to="/admin/circulars/new">
                <Plus /> New circular
              </Link>
            </Button>
          )
        }
      />
      <StatusTabs
        value={stage}
        onChange={(s) => (setStage(s), reset())}
        options={[
          { value: 'DRAFT', label: 'Drafts' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ]}
        counts={data?.counts}
      />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), reset())} placeholder="Subject, reference or message…" />
        <FilterSelect label="Year" value={year} onChange={(v) => (setYear(v), reset())} options={(years.data ?? []).map((y) => ({ value: String(y), label: String(y) }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        rowLink={(r) => ({ to: '/admin/circulars/$id', params: { id: String(r.id) } })}
        empty={<EmptyState icon={Megaphone} title="No circulars found" description={canEdit ? 'Write a new circular to reach staff by SMS, email and the staff portal.' : undefined} />}
        columns={[
          {
            header: 'Date',
            cell: (r) => <span className="text-xs whitespace-nowrap text-slate-600">{date(r.publishedAt ?? r.createdAt)}</span>,
          },
          {
            header: 'Circular',
            cell: (r) => (
              <span className="block max-w-[22rem] min-w-52">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-slate-800">{r.subject}</span>
                  {r.attachment && <Paperclip className="size-3.5 shrink-0 text-muted-foreground" aria-label="PDF attached" />}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.letterNo && <span className="font-mono">{r.letterNo} · </span>}
                  {r.smsNote || r.message || '—'}
                </span>
              </span>
            ),
          },
          { header: 'Audience', cell: (r) => <span className="block max-w-40 truncate text-xs" title={audienceLabel(r.audience)}>{audienceLabel(r.audience)}</span> },
          { header: 'Sent by', cell: (r) => <Channels sms={Number(r.sendSms) === 1} email={Number(r.sendEmail) === 1} portal={Number(r.sendPortal) === 1} /> },
          { header: 'Recipients', align: 'right', cell: (r) => <span className="font-mono text-xs">{r.recipientCount != null ? num(r.recipientCount) : '—'}</span> },
          {
            header: 'Stage',
            cell: (r) => (r.sending ? <Badge tone="info">Sending…</Badge> : <Badge tone={STAGE_TONES[r.stage]}>{STAGE_LABELS[r.stage] ?? r.stage}</Badge>),
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Open', icon: Eye, onSelect: () => navigate({ to: '/admin/circulars/$id', params: { id: String(r.id) } }) },
                  { label: 'Edit draft', icon: Pencil, hidden: !canEdit || r.stage !== 'DRAFT', onSelect: () => navigate({ to: '/admin/circulars/$id/edit', params: { id: String(r.id) } }) },
                  'separator',
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canManage || r.stage === 'PUBLISHED',
                    onSelect: () =>
                      confirm({
                        title: `Delete “${r.subject}”?`,
                        description: r.stage === 'DRAFT' ? 'The draft is removed permanently.' : 'The circular and its copies in staff portal inboxes are removed permanently.',
                        danger: true,
                        confirmLabel: 'Delete',
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
