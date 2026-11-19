import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, Clock, GraduationCap, Mail, MessageSquareText, Play, Send, ServerCog, TriangleAlert, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { dateTime, relative } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Input, NativeSelect } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'

export const Route = createFileRoute('/admin/notifications')({ component: NotificationsPage })

type Row = Record<string, any> & { id: number }
interface Status {
  sms: { mnotify: boolean; smsonlinegh: boolean; sender: string; simulated: boolean }
  email: { gmail: boolean; from: string | null; simulated: boolean }
  scheduler: boolean
  dailyHourGmt: number
  lastRuns: Record<string, Row>
}

const KINDS: Record<string, string> = {
  leave_ended: 'Leave ended',
  leave_reminder: 'Leave reminder',
  birthday: 'Birthday',
  nss_thanks: 'NSS thank-you',
  transfer: 'Transfer',
  disciplinary: 'Disciplinary',
  circular: 'Circular',
  test: 'Test',
}
const STATUS_TONE: Record<string, 'success' | 'brand' | 'danger' | 'neutral' | 'warning'> = {
  sent: 'success',
  simulated: 'brand',
  failed: 'danger',
  skipped: 'neutral',
  pending: 'warning',
}
const SUMMARY_LABELS: Record<string, string> = {
  leave_ended: 'leaves ended',
  leave_ended_quietly: 'old leaves closed quietly',
  leave_reminders: 'leave reminders',
  birthdays: 'birthdays',
  nss_completed: 'NSS completed',
}

function Gateway({ icon: Icon, title, lines, ok, simulated }: { icon: typeof Mail; title: string; lines: Array<React.ReactNode>; ok: boolean; simulated?: boolean }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={cn('flex size-9 items-center justify-center rounded-xl', ok ? 'bg-success-soft text-emerald-700' : simulated ? 'bg-primary-soft text-primary' : 'bg-secondary-light text-secondary-light-foreground')}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">{title}</p>
          <p className="text-xs text-muted-foreground">{ok ? 'Configured' : simulated ? 'Simulated (development)' : 'Not configured'}</p>
        </div>
        {ok ? <CheckCircle2 className="size-5 text-success" /> : simulated ? <Badge tone="brand">Simulated</Badge> : <XCircle className="size-5 text-destructive" />}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-slate-600">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  )
}

function JobCard({
  icon: Icon,
  title,
  schedule,
  does,
  run,
  onRun,
  canRun,
  busy,
  extra,
}: {
  icon: typeof Mail
  title: string
  schedule: string
  does: Array<string>
  run?: Row
  onRun: () => void
  canRun: boolean
  busy: boolean
  extra?: React.ReactNode
}) {
  const summary = (run?.summary ?? {}) as Record<string, number>
  const chips = Object.entries(summary).filter(([k]) => SUMMARY_LABELS[k])
  const sends = Object.entries(summary).filter(([k]) => /^(sms|email)_/.test(k))
  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Icon className="size-4 text-secondary-foreground" /> {title}
          </span>
        }
        description={schedule}
        action={
          canRun && (
            <Button size="sm" variant="outline" onClick={onRun} disabled={busy}>
              <Play /> Run now
            </Button>
          )
        }
      />
      <CardBody className="space-y-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {does.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {extra}
        <div className="rounded-xl bg-slate-50 p-3 text-xs">
          {run ? (
            <>
              <p className="flex flex-wrap items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground" />
                Last run {relative(run.startedAt)} ({run.triggerType === 'schedule' ? 'on schedule' : 'by hand'}) · {dateTime(run.startedAt)}
                {run.error && <Badge tone="danger">Failed</Badge>}
              </p>
              {(chips.length > 0 || sends.length > 0) && (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {chips.map(([k, v]) => (
                    <Badge key={k} tone="brand" dot={false}>
                      {v} {SUMMARY_LABELS[k]}
                    </Badge>
                  ))}
                  {sends.map(([k, v]) => {
                    const [channel, outcome] = k.split('_') as [string, string]
                    const words: Record<string, string> = { duplicate: 'already sent', 'no-address': 'with no number/address', simulated: 'simulated', sent: 'sent', failed: 'failed', skipped: 'not configured' }
                    return (
                      <Badge key={k} tone={outcome === 'failed' ? 'danger' : outcome === 'sent' ? 'success' : outcome === 'simulated' ? 'brand' : 'neutral'} dot={false}>
                        {v} {channel === 'sms' ? 'SMS' : 'email'} {words[outcome] ?? outcome}
                      </Badge>
                    )
                  })}
                </p>
              )}
              {run.error && <p className="mt-1 text-secondary-foreground">{run.error}</p>}
              {chips.length === 0 && sends.length === 0 && !run.error && <p className="mt-1 text-muted-foreground">Nothing was due.</p>}
            </>
          ) : (
            <p className="text-muted-foreground">Not run yet.</p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

function NotificationsPage() {
  const canManage = useCan('notifications', 'manage')
  const { confirm, dialog } = useConfirm()
  const [testing, setTesting] = useState(false)
  const [nssYear, setNssYear] = useState(new Date().getFullYear())
  const status = useQuery({ queryKey: ['notification-status'], queryFn: () => api.get<Status>('/notifications/status'), refetchInterval: 30_000 })
  const runJob = useSave(({ job, year }: { job: 'daily' | 'nss'; year?: number }) => api.post<{ ok: boolean; summary: Record<string, number>; error?: string }>(`/notifications/jobs/${job}/run`, { year }), {
    invalidate: ['notification-status', 'notifications', 'leave-records', 'nss'],
    success: (r) => (r.ok ? 'Job finished' : `Job failed: ${r.error}`),
  })
  const s = status.data
  return (
    <>
      {dialog}
      <TestDialog open={testing} onClose={() => setTesting(false)} />
      <PageHeader
        eyebrow="System"
        title="Notifications"
        description="SMS (mNotify, with SMSOnlineGH as backup) and email (Google) sent to staff and national service personnel, on schedule and when records change."
        actions={
          canManage && (
            <Button variant="outline" onClick={() => setTesting(true)}>
              <Send /> Send a test
            </Button>
          )
        }
      />

      {s && (
        <>
          {(s.sms.simulated || s.email.simulated) && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                <b>Simulation mode.</b> No gateway keys are set, so messages are written to the log as "simulated" and nothing reaches staff. Add the mNotify,
                SMSOnlineGH and Gmail keys to the server's environment to send for real.
              </p>
            </div>
          )}
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <Gateway
              icon={MessageSquareText}
              title="SMS"
              ok={s.sms.mnotify || s.sms.smsonlinegh}
              simulated={s.sms.simulated}
              lines={[
                <>Primary: mNotify — {s.sms.mnotify ? 'ready' : 'no API key'}</>,
                <>Backup: SMSOnlineGH — {s.sms.smsonlinegh ? 'ready' : 'no API key'}</>,
                <>
                  Sender ID: <b className="font-mono">{s.sms.sender}</b>
                </>,
              ]}
            />
            <Gateway icon={Mail} title="Email (Google)" ok={s.email.gmail} simulated={s.email.simulated} lines={[<>From: {s.email.from ?? '— (set GMAIL_USER)'}</>, <>Gmail with an app password</>]} />
            <Gateway
              icon={ServerCog}
              title="Scheduler"
              ok={s.scheduler}
              lines={[
                s.scheduler ? <>Runs the jobs below on schedule (times in GMT).</> : <>Off — set SCHEDULER_ENABLED=true. Jobs can still be run by hand.</>,
              ]}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <JobCard
              icon={CalendarClock}
              title="Daily: leave & birthdays"
              schedule={`Every day at ${String(s.dailyHourGmt).padStart(2, '0')}:00 GMT`}
              does={[
                'Marks granted leave whose end date has passed as ended, releases the reliever, and tells the staff member (SMS & email) when to resume. Leave that ended over a week ago is closed without a message.',
                'Reminds staff (SMS & email) when their granted leave ends within the next 3 days.',
                'Sends birthday wishes from the Directorate (SMS & email) to staff celebrating today.',
              ]}
              run={s.lastRuns.daily}
              canRun={canManage}
              busy={runJob.isPending}
              onRun={() => confirm({ title: 'Run the daily job now?', description: 'Due leave is ended and today’s messages are sent. Messages already sent are never repeated.', confirmLabel: 'Run now', onConfirm: () => runJob.mutateAsync({ job: 'daily' }) })}
            />
            <JobCard
              icon={GraduationCap}
              title="National service completion"
              schedule="Every 1 November at 07:00 GMT"
              does={['Marks national service personnel whose service has ended as completed.', 'Thanks each of them by SMS for their service and wishes them well.']}
              run={s.lastRuns.nss}
              canRun={canManage}
              busy={runJob.isPending}
              extra={
                canManage && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Service year ending by 1 November
                    <Input type="number" value={nssYear} onChange={(e) => setNssYear(Number(e.target.value))} className="h-8 w-24" />
                  </label>
                )
              }
              onRun={() =>
                confirm({
                  title: `Complete national service for ${nssYear}?`,
                  description: `Personnel whose service ended before 1 November ${nssYear} are marked completed and thanked by SMS.`,
                  confirmLabel: 'Run now',
                  onConfirm: () => runJob.mutateAsync({ job: 'nss', year: nssYear }),
                })
              }
            />
          </div>
        </>
      )}

      <Tabs defaultValue="log">
        <TabsList className="mb-4">
          <TabsTrigger value="log">
            <MessageSquareText /> Message log
          </TabsTrigger>
          <TabsTrigger value="previews">
            <Mail /> Message previews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="log">
          <MessageLog />
        </TabsContent>
        <TabsContent value="previews">
          <Previews />
        </TabsContent>
      </Tabs>
    </>
  )
}

function MessageLog() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('')
  const [channel, setChannel] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { q, kind, channel, status, page }],
    queryFn: () => api.get<Page<Row>>('/notifications', { q, kind, channel, status, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, number, email or staff no…" />
        <FilterSelect label="Message" value={kind} onChange={(v) => (setKind(v), setPage(1))} options={Object.entries(KINDS).map(([value, label]) => ({ value, label }))} />
        <FilterSelect label="Channel" value={channel} onChange={(v) => (setChannel(v), setPage(1))} options={[{ value: 'sms', label: 'SMS' }, { value: 'email', label: 'Email' }]} />
        <FilterSelect label="Status" value={status} onChange={(v) => (setStatus(v), setPage(1))} options={['sent', 'simulated', 'failed', 'skipped'].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={MessageSquareText} title="No messages yet" description="Messages appear here as they are sent." />}
        columns={[
          { header: 'When', cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground">{dateTime(r.createdAt)}</span> },
          { header: 'Message', cell: (r) => <Badge tone="brand" dot={false}>{KINDS[r.kind] ?? r.kind}</Badge> },
          {
            header: 'To',
            cell: (r) => (
              <span className="block max-w-56">
                <span className="block truncate text-sm font-semibold text-slate-800">{r.recipientName ?? '—'}</span>
                <span className="flex items-center gap-1 truncate font-mono text-[0.7rem] text-muted-foreground">
                  {r.channel === 'sms' ? <MessageSquareText className="size-3" /> : <Mail className="size-3" />} {r.recipient}
                </span>
              </span>
            ),
          },
          {
            header: 'Content',
            cell: (r) => (
              <span className="line-clamp-2 min-w-52 max-w-96 text-xs" title={r.message}>
                {r.subject ? <b>{r.subject} — </b> : null}
                {r.message}
              </span>
            ),
          },
          {
            header: 'Status',
            cell: (r) => (
              <span title={r.error ?? undefined} className="flex flex-col gap-0.5">
                <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status}</Badge>
                {r.provider && <span className="text-[0.65rem] text-muted-foreground">via {r.provider}</span>}
              </span>
            ),
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function Previews() {
  const { data } = useQuery({ queryKey: ['notification-previews'], queryFn: () => api.get<Array<Row>>('/notifications/previews') })
  return (
    <div className="space-y-4">
      {data?.map((p) => (
        <Card key={p.kind}>
          <CardHeader title={p.label} description={p.subject ? `Email subject: ${p.subject}` : 'SMS only'} />
          <CardBody className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div>
              <p className="eyebrow mb-2">SMS · {p.smsLength} characters ({Math.ceil(p.smsLength / 153)} part{Math.ceil(p.smsLength / 153) === 1 ? '' : 's'})</p>
              <div className="max-w-sm rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800">{p.sms}</div>
            </div>
            {p.html && (
              <div className="min-w-0">
                <p className="eyebrow mb-2">Email</p>
                <iframe title={p.label} srcDoc={p.html} className="h-[460px] w-full rounded-xl border bg-white" sandbox="" />
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

function TestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [template, setTemplate] = useState('plain')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Array<{ channel: string; status: string }> | null>(null)
  const send = useSave((v: { phone: string; email: string; template: string }) => api.post<{ results: Array<{ channel: string; status: string }> }>('/notifications/test', v), {
    invalidate: ['notifications'],
    onDone: (r) => setResult(r.results),
    onError: setError,
  })
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setResult(null), setError(null))}
      title="Send a test message"
      description="Checks the SMS and email gateways. Test messages appear in the log."
      submitLabel="Send test"
      busy={send.isPending}
      error={error}
      onSubmit={(e) => (e.preventDefault(), setError(null), setResult(null), send.mutate({ phone, email, template }))}
    >
      <Field label="Message" className="sm:col-span-2" hint="Real messages are personalised when the phone or email belongs to a staff member.">
        <NativeSelect value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="plain">Gateway check (short test message)</option>
          {Object.entries(KINDS)
            .filter(([k]) => k !== 'test' && k !== 'circular')
            .map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
        </NativeSelect>
      </Field>
      <Field label="Phone number">
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" />
      </Field>
      <Field label="Email address">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@ucc.edu.gh" />
      </Field>
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
