import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Archive, Copy, ExternalLink, FileText, Globe, Loader2, Mail, MessageSquareText, Pencil, RotateCcw, Send, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, dateTime, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { Channels, STAGE_LABELS, STAGE_TONES, SmsBubble, audienceLabel, smsParts } from '#/components/circulars/shared'
import type { Audience, AudienceSummary } from '#/components/circulars/shared'

export const Route = createFileRoute('/admin/circulars/$id/')({ component: CircularPage })

type R = Record<string, any>
type Tally = Record<string, number>

/** Gmail sends to about 500 people a day (2,000 on Google Workspace). */
const GMAIL_DAILY = 500

const total = (t: Tally | null | undefined) => Object.values(t ?? {}).reduce((s, n) => s + Number(n), 0)

function CircularPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const canEdit = useCan('circulars', 'edit')
  const canManage = useCan('circulars', 'manage')
  const { confirm, dialog } = useConfirm()
  const [testing, setTesting] = useState(false)
  const { data: c, isLoading } = useQuery({
    queryKey: ['circulars', id],
    queryFn: () => api.get<R>(`/circulars/${id}`),
    // Follow the progress while SMS and email are going out.
    refetchInterval: (q) => (q.state.data?.progress?.running ? 2000 : false),
  })
  const draft = c?.stage === 'DRAFT'
  const reach = useQuery({
    queryKey: ['circular-audience', c?.audience],
    queryFn: () => api.post<AudienceSummary>('/circulars/audience', c!.audience),
    enabled: Boolean(draft && c?.audience),
  })
  const invalidate = ['circulars', 'circular-recipients']
  const publish = useSave(() => api.post<{ recipients: number }>(`/circulars/${id}/publish`), { invalidate, success: (r) => `Published to ${num(r.recipients)} staff. Messages are going out.` })
  const resend = useSave(() => api.post(`/circulars/${id}/resend`), { invalidate, success: 'Resending messages that did not go out' })
  const archive = useSave(() => api.post(`/circulars/${id}/archive`), { invalidate, success: 'Circular archived' })
  const remove = useSave(() => api.delete(`/circulars/${id}`), { invalidate, success: 'Circular deleted', onDone: () => navigate({ to: '/admin/circulars' }) })

  if (isLoading) return <ProfileSkeleton />
  if (!c) return <EmptyState title="Circular not found" />

  const audience = c.audience as Audience
  const running = Boolean(c.progress?.running)
  const sendSms = Number(c.sendSms) === 1
  const sendEmail = Number(c.sendEmail) === 1
  const sendPortal = Number(c.sendPortal) === 1
  const failed = (c.delivery.sms.failed ?? 0) + (c.delivery.sms.skipped ?? 0) + (c.delivery.email.failed ?? 0) + (c.delivery.email.skipped ?? 0)

  const confirmPublish = () => {
    const s = reach.data
    const parts = smsParts(String(c.sms).length)
    const lines = [
      s ? `${num(s.count)} staff will receive it.` : null,
      sendPortal ? 'It goes into their staff portal inbox.' : null,
      sendSms && s ? `${num(s.withPhone)} SMS (${parts} part${parts === 1 ? '' : 's'} each).` : null,
      sendEmail && s ? `${num(s.withEmail)} emails${c.attachment ? ' with the PDF attached' : ''}.` : null,
      sendEmail && s && s.withEmail > GMAIL_DAILY
        ? `Gmail limits how many people one account can email in a day (about ${num(GMAIL_DAILY)}, or 2,000 on Google Workspace). Emails over the limit fail and can be resent the next day.`
        : null,
      'This cannot be undone.',
    ]
    confirm({ title: `Publish “${c.subject}”?`, description: lines.filter(Boolean).join(' '), confirmLabel: 'Publish now', onConfirm: () => publish.mutateAsync(undefined) })
  }

  return (
    <>
      {dialog}
      <TestDialog id={id} open={testing} onClose={() => setTesting(false)} sms={sendSms} email={sendEmail} />
      <PageHeader
        back={{ to: '/admin/circulars', label: 'Circulars' }}
        eyebrow={c.letterNo ? `Ref: ${c.letterNo}` : 'Circular'}
        title={c.subject}
        meta={
          <>
            {running ? <Badge tone="info">Sending…</Badge> : <Badge tone={STAGE_TONES[c.stage]}>{STAGE_LABELS[c.stage]}</Badge>}
            <span className="text-xs text-muted-foreground">
              {c.publishedAt ? `Published ${dateTime(c.publishedAt)}${c.publishedByName ? ` by ${c.publishedByName}` : ''}` : `Drafted ${dateTime(c.createdAt)}${c.createdByName ? ` by ${c.createdByName}` : ''}`}
            </span>
            <Channels sms={sendSms} email={sendEmail} portal={sendPortal} />
          </>
        }
        actions={
          <>
            {canManage && c.stage !== 'PUBLISHED' && (
              <Button variant="outline" onClick={() => confirm({ title: `Delete “${c.subject}”?`, description: draft ? 'The draft is removed permanently.' : 'The circular and its copies in staff portal inboxes are removed permanently.', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(undefined) })}>
                <Trash2 /> Delete
              </Button>
            )}
            {canEdit && draft && (
              <Button variant="outline" asChild>
                <Link to="/admin/circulars/$id/edit" params={{ id }}>
                  <Pencil /> Edit
                </Link>
              </Button>
            )}
            {canEdit && c.stage !== 'ARCHIVED' && (sendSms || sendEmail) && (
              <Button variant="outline" onClick={() => setTesting(true)}>
                <Send /> Send test
              </Button>
            )}
            {canManage && c.stage === 'PUBLISHED' && !running && failed > 0 && (
              <Button variant="outline" onClick={() => confirm({ title: 'Resend undelivered messages?', description: `${num(failed)} SMS or emails did not go out. Only those are sent again.`, confirmLabel: 'Resend', onConfirm: () => resend.mutateAsync(undefined) })}>
                <RotateCcw /> Resend failed
              </Button>
            )}
            {canManage && c.stage === 'PUBLISHED' && !running && (
              <Button variant="outline" onClick={() => confirm({ title: 'Archive this circular?', description: 'It comes off the staff portal notices. Copies already in staff inboxes stay.', confirmLabel: 'Archive', onConfirm: () => archive.mutateAsync(undefined) })}>
                <Archive /> Archive
              </Button>
            )}
            {canManage && draft && (
              <Button onClick={confirmPublish} disabled={publish.isPending || !reach.data?.count}>
                {publish.isPending ? <Loader2 className="animate-spin" /> : <Send />} Publish
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Circular" description={date(c.publishedAt ?? c.createdAt, 'long')} />
            <CardBody>
              {c.message ? (
                <div className="space-y-3 text-[0.95rem] leading-relaxed break-words whitespace-pre-line text-slate-700">{c.message}</div>
              ) : (
                <p className="text-sm text-muted-foreground">No message. The attached PDF is the circular.</p>
              )}
            </CardBody>
          </Card>
          {c.attachmentUrl && <PdfPanel c={c} />}
          {c.stage !== 'DRAFT' && Number(c.recipientCount ?? 0) > 0 && <Recipients id={id} sms={sendSms} email={sendEmail} portal={sendPortal} />}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Audience" description={audienceLabel(audience, { units: c.audienceNames.units.length, jobs: c.audienceNames.jobs.length })} />
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
                  <Users className="size-5" />
                </span>
                <span>
                  <span className="block text-2xl leading-none font-extrabold text-primary">{num(draft ? reach.data?.count : c.recipientCount)}</span>
                  <span className="text-xs text-muted-foreground">{draft ? 'staff will receive it' : 'staff received it'}</span>
                </span>
              </div>
              {draft && reach.data && (
                <p className="text-xs text-muted-foreground">
                  {num(reach.data.withPhone)} with a phone number · {num(reach.data.withEmail)} with an email address
                </p>
              )}
              <AudienceDetail audience={audience} names={c.audienceNames} />
            </CardBody>
          </Card>

          {c.stage !== 'DRAFT' && (sendSms || sendEmail || sendPortal) && Number(c.recipientCount ?? 0) > 0 && (
            <Card>
              <CardHeader title="Delivery" description={running ? 'Messages are going out…' : c.progress?.finishedAt ? `Last run finished ${dateTime(c.progress.finishedAt)}` : undefined} />
              <CardBody className="space-y-4">
                {sendPortal && (
                  <DeliveryRow icon={Globe} label="Staff portal" done={c.delivery.portal.posted} of={c.recipientCount}>
                    {num(c.delivery.portal.posted)} in inboxes · {num(c.delivery.portal.opened)} opened
                  </DeliveryRow>
                )}
                {sendSms && <ChannelRow icon={MessageSquareText} label="SMS" tally={running && c.progress?.sms ? c.progress.sms : c.delivery.sms} of={c.recipientCount} running={running} />}
                {sendEmail && <ChannelRow icon={Mail} label="Email" tally={running && c.progress?.email ? c.progress.email : c.delivery.email} of={c.recipientCount} running={running} />}
                {c.progress?.error && <p className="text-xs font-medium text-destructive">Sending stopped: {c.progress.error}</p>}
              </CardBody>
            </Card>
          )}

          {sendSms && (
            <Card>
              <CardHeader title="SMS" description={`${String(c.sms).length} characters · ${smsParts(String(c.sms).length)} part${smsParts(String(c.sms).length) === 1 ? '' : 's'}`} />
              <CardBody>
                <SmsBubble text={c.sms} />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function AudienceDetail({ audience, names }: { audience: Audience; names: { units: Array<R>; jobs: Array<R>; staff: Array<R> } }) {
  const groups: Array<[string, Array<string>]> = [
    ['Staff categories', audience.staffGroups.map((g) => `${g} · ${GROUP_LABELS[g]}`)],
    [audience.includeSubunits ? 'Units (with sub-units)' : 'Units', names.units.map((u) => u.name)],
    ['Designations', names.jobs.map((j) => j.name)],
    ['Named staff', names.staff.map((s) => `${s.fullName} (${s.staffNo})`)],
  ]
  const shown = groups.filter(([, list]) => list.length)
  if (!shown.length && !audience.headsOnly) return <p className="text-xs text-muted-foreground">Every active member of staff.</p>
  return (
    <div className="space-y-3">
      {audience.headsOnly && <Badge tone="brand">Heads of units only</Badge>}
      {shown.map(([label, list]) => (
        <div key={label}>
          <p className="eyebrow mb-1.5">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {list.slice(0, 12).map((x) => (
              <span key={x} className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                {x}
              </span>
            ))}
            {list.length > 12 && <span className="text-xs text-muted-foreground">+{list.length - 12} more</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function DeliveryRow({ icon: Icon, label, done, of, children }: { icon: typeof Mail; label: string; done: number; of: number; children: React.ReactNode }) {
  const pct = of ? Math.min(100, Math.round((done / of) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Icon className="size-4 text-primary" /> {label}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>
    </div>
  )
}

function ChannelRow({ icon, label, tally, of, running }: { icon: typeof Mail; label: string; tally: Tally; of: number; running: boolean }) {
  const reached = (tally.sent ?? 0) + (tally.simulated ?? 0)
  const failed = (tally.failed ?? 0) + (tally.skipped ?? 0)
  const pending = tally.pending ?? 0
  const noAddress = tally['no-address'] ?? (running ? 0 : Math.max(0, of - total(tally)))
  return (
    <DeliveryRow icon={icon} label={label} done={reached} of={of}>
      <span className="flex flex-wrap gap-x-3 gap-y-0.5">
        <span>
          <b className="text-emerald-700">{num(reached)}</b> sent{tally.simulated ? ` (${num(tally.simulated)} simulated)` : ''}
        </span>
        {failed > 0 && (
          <span>
            <b className="text-destructive">{num(failed)}</b> failed
          </span>
        )}
        {pending > 0 && <span>{num(pending)} waiting</span>}
        {noAddress > 0 && <span>{num(noAddress)} with no {label === 'SMS' ? 'number' : 'address'}</span>}
      </span>
    </DeliveryRow>
  )
}

function PdfPanel({ c }: { c: R }) {
  const stored = String(c.attachmentUrl).startsWith('/api/files/')
  const copy = () => navigator.clipboard?.writeText(c.publicUrl).then(() => toast.success('Link copied'))
  return (
    <Card>
      <CardHeader
        title={c.attachmentName ?? 'Circular document'}
        description={stored ? 'Attached to the email and opened from the staff portal.' : 'Uploaded through the old HRMS.'}
        action={
          <span className="flex gap-1.5">
            {c.publicUrl && stored && (
              <Button variant="outline" size="sm" onClick={copy} title="Link staff can open without signing in">
                <Copy /> Staff link
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={c.attachmentUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> Open
              </a>
            </Button>
          </span>
        }
      />
      {stored ? (
        <iframe src={c.attachmentUrl} title={c.attachmentName ?? 'Circular'} className="h-[75dvh] min-h-[28rem] w-full rounded-b-2xl bg-slate-100" />
      ) : (
        <CardBody>
          <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <FileText className="size-4" /> Open the PDF on the old HRMS
          </a>
        </CardBody>
      )}
    </Card>
  )
}

const STATUS_TONE: Record<string, 'success' | 'brand' | 'danger' | 'neutral' | 'warning'> = { sent: 'success', simulated: 'brand', failed: 'danger', skipped: 'danger', pending: 'warning' }

function Recipients({ id, sms, email, portal }: { id: string; sms: boolean; email: boolean; portal: boolean }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['circular-recipients', id, { q, filter, page }],
    queryFn: () => api.get<Page<R>>(`/circulars/${id}/recipients`, { q, filter, page }),
    placeholderData: keepPreviousData,
  })
  const status = (s: string | null, address: string | null) =>
    s ? <Badge tone={STATUS_TONE[s] ?? 'neutral'}>{s}</Badge> : <span className="text-xs text-muted-foreground">{address ? '—' : 'No address'}</span>
  return (
    <Card>
      <CardHeader title="Recipients" description={data ? `${num(data.total)} staff` : undefined} />
      <CardBody className="space-y-3">
        <Toolbar>
          <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
          <FilterSelect
            label="Show"
            value={filter}
            onChange={(v) => (setFilter(v), setPage(1))}
            options={[
              ...(sms ? [{ value: 'sms_failed', label: 'SMS not delivered' }] : []),
              ...(email ? [{ value: 'email_failed', label: 'Email not delivered' }] : []),
              ...(portal
                ? [
                    { value: 'read', label: 'Opened on the portal' },
                    { value: 'unread', label: 'Not opened on the portal' },
                  ]
                : []),
            ]}
          />
        </Toolbar>
        <DataTable
          loading={isLoading}
          rows={data?.data}
          rowLink={(r) => ({ to: '/admin/staff/$staffNo', params: { staffNo: String(r.staffNo) } })}
          empty={<EmptyState icon={Users} title="No recipients match" />}
          columns={[
            {
              header: 'Staff',
              cell: (r) => (
                <span className="block max-w-64 min-w-40">
                  <span className="block truncate font-semibold text-slate-800">{r.fullName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {r.staffNo} · {r.unitName ?? '—'}
                  </span>
                </span>
              ),
            },
            ...(sms ? [{ header: 'SMS', cell: (r: R) => status(r.smsStatus, r.phone) }] : []),
            ...(email ? [{ header: 'Email', cell: (r: R) => status(r.emailStatus, r.email) }] : []),
            ...(portal
              ? [
                  {
                    header: 'Portal',
                    cell: (r: R) =>
                      r.notificationId ? (
                        <Badge tone={r.readFlag === '1' ? 'success' : 'neutral'} dot={false}>
                          {r.readFlag === '1' ? 'Opened' : 'Delivered'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      ),
                  },
                ]
              : []),
          ]}
        />
        {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
      </CardBody>
    </Card>
  )
}

function TestDialog({ id, open, onClose, sms, email }: { id: string; open: boolean; onClose: () => void; sms: boolean; email: boolean }) {
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Array<{ channel: string; status: string }> | null>(null)
  const send = useSave((v: { phone: string; email: string }) => api.post<{ results: Array<{ channel: string; status: string }> }>(`/circulars/${id}/test`, v), {
    invalidate: ['notifications'],
    onDone: (r) => setResult(r.results),
    onError: setError,
  })
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setResult(null), setError(null))}
      title="Send a test"
      description="See the circular exactly as staff will, before you publish. The email subject starts with [Test]."
      submitLabel="Send test"
      busy={send.isPending}
      error={error}
      onSubmit={(e) => (e.preventDefault(), setError(null), setResult(null), send.mutate({ phone: sms ? phone : '', email: email ? address : '' }))}
    >
      {sms && (
        <Field label="Phone number">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" />
        </Field>
      )}
      {email && (
        <Field label="Email address">
          <Input type="email" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="name@ucc.edu.gh" />
        </Field>
      )}
      {result && (
        <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm sm:col-span-2">
          {result.map((r) => (
            <p key={r.channel}>
              {r.channel === 'sms' ? 'SMS' : 'Email'}: <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status}</Badge>
            </p>
          ))}
        </div>
      )}
    </FormDialog>
  )
}

