import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FileText, LifeBuoy, MessageSquareReply } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { dateTime } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { NativeSelect, Textarea } from '#/components/ui/input'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { StatusTabs } from '#/components/admin/status-tabs'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '#/components/portal/labels'

export const Route = createFileRoute('/admin/service-desk')({ component: ServiceDesk })

type R = Record<string, any>
const CATEGORIES: Record<string, string> = { IT: 'IT helpdesk', EDUROAM: 'Eduroam & Wi-Fi', XPAY: 'XPay', COUNSELLING: 'Counselling', HR: 'HR enquiry' }

function ServiceDesk() {
  const canEdit = useCan('servicedesk', 'edit')
  const [status, setStatus] = useState('OPEN')
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [replying, setReplying] = useState<R | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['service-desk', { status, category, q, page }],
    queryFn: () => api.get<Page<R> & { counts: Array<{ status: string; count: number }> }>('/service-desk', { status, category, q, page }),
    placeholderData: keepPreviousData,
  })
  const reset = () => setPage(1)
  return (
    <>
      <ReplyDialog request={replying} onClose={() => setReplying(null)} />
      <PageHeader eyebrow="System" title="Service desk" description="Requests staff raise from the staff portal: IT helpdesk, Eduroam & Wi-Fi, XPay and counselling. Replies go to the staff member’s portal inbox." />
      <StatusTabs
        value={status}
        onChange={(s) => (setStatus(s), reset())}
        options={Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        counts={data?.counts}
      />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), reset())} placeholder="Subject, details, name or staff number…" />
        <FilterSelect label="Service" value={category} onChange={(v) => (setCategory(v), reset())} options={Object.entries(CATEGORIES).map(([value, label]) => ({ value, label }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={LifeBuoy} title="No requests" />}
        columns={[
          { header: 'Staff', cell: (r: R) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.unitName} /> },
          {
            header: 'Request',
            cell: (r: R) => (
              <span className="block max-w-[26rem] min-w-56">
                <span className="flex items-center gap-1.5">
                  <Badge dot={false}>{CATEGORIES[r.category] ?? r.category}</Badge>
                  <span className="truncate font-semibold text-slate-800">{r.title}</span>
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{r.description}</span>
                {r.attachment && (
                  <a href={r.attachment} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <FileText className="size-3.5" /> {r.attachmentName ?? 'Attachment'}
                  </a>
                )}
              </span>
            ),
          },
          { header: 'Raised', cell: (r: R) => <span className="text-xs whitespace-nowrap">{dateTime(r.createdAt)}</span> },
          {
            header: 'Status',
            cell: (r: R) => (
              <span className="block max-w-48">
                <Badge tone={REQUEST_STATUS_TONES[r.status] ?? 'neutral'}>{REQUEST_STATUS_LABELS[r.status] ?? r.status}</Badge>
                {r.respondedByName && <span className="mt-1 block truncate text-xs text-muted-foreground">by {r.respondedByName}</span>}
              </span>
            ),
          },
          {
            header: '',
            align: 'right',
            cell: (r: R) =>
              canEdit && r.status !== 'CLOSED' ? (
                <Button size="sm" variant="outline" onClick={() => setReplying(r)}>
                  <MessageSquareReply /> Reply
                </Button>
              ) : null,
          },
        ]}
      />
      {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function ReplyDialog({ request, onClose }: { request: R | null; onClose: () => void }) {
  const [status, setStatus] = useState('RESOLVED')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const save = useSave((v: { id: number; status: string; response: string }) => api.post(`/service-desk/${v.id}/respond`, { status: v.status, response: v.response }), {
    invalidate: ['service-desk'],
    success: 'Reply sent to the staff member',
    onDone: () => (setResponse(''), onClose()),
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(request)}
      onOpenChange={(o) => !o && (onClose(), setError(null))}
      title={request ? `Reply: ${request.title}` : 'Reply'}
      description={request ? `${request.fullName} (${request.staffNo}) · ${request.phone ?? ''} ${request.uccMail ?? ''}` : undefined}
      submitLabel="Send reply"
      busy={save.isPending}
      error={error}
      onSubmit={(e) => (e.preventDefault(), request && save.mutate({ id: request.id, status, response }))}
    >
      {request && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm break-words whitespace-pre-line text-slate-700 sm:col-span-2">{request.description}</p>}
      {request?.response && <p className="text-xs text-muted-foreground sm:col-span-2">Previous reply: {request.response}</p>}
      <Field label="Reply" required className="sm:col-span-2">
        <Textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} />
      </Field>
      <Field label="Status">
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="IN_PROGRESS">In progress (still working on it)</option>
          <option value="RESOLVED">Resolved</option>
        </NativeSelect>
      </Field>
    </FormDialog>
  )
}
