import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, CalendarRange, Inbox, LifeBuoy, Megaphone, Paperclip, Users } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { StatCard } from '#/components/admin/charts'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { MY_LEAVE_LABELS } from '#/components/portal/labels'
import { useStaff } from '#/components/portal/session'

export const Route = createFileRoute('/portal/')({ component: Overview })

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Overview() {
  const staff = useStaff()
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'overview'], queryFn: () => api.get<Record<string, any>>('/portal/overview') })
  if (isLoading || !data) return <ProfileSkeleton />
  const leave = data.leave
  const next = data.nextLeave
  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        title={`${greeting()}, ${staff.firstName || staff.fullName}`}
        description={[staff.jobTitle, staff.unitName].filter(Boolean).join(' · ') || undefined}
        actions={
          <Button asChild>
            <Link to="/portal/leave" search={{ apply: true } as never}>
              <CalendarDays /> Apply for leave
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatCard accent icon={CalendarRange} label={`Annual leave ${data.year}`} value={`${num(leave.remaining)} days`} sub={`left of ${num(leave.total)} · ${num(leave.used)} taken`} />
        <StatCard icon={Inbox} label="Applications in progress" value={num(data.pendingLeave)} sub={data.pendingLeave ? 'Waiting for your head or HR' : 'Nothing pending'} />
        <StatCard icon={Megaphone} label="Notifications" value={num(data.unread)} sub={data.unread ? 'Unread' : 'All caught up'} />
        {staff.isManager ? (
          <StatCard icon={Users} label="Leave to review" value={num(data.approvals)} sub={data.approvals ? 'Applications from your staff' : 'Nothing waiting for you'} />
        ) : (
          <StatCard icon={LifeBuoy} label="Open requests" value={num(data.openRequests)} sub="Helpdesk, Eduroam, counselling" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Latest circulars"
            action={
              <Link to="/portal/circulars" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                All circulars <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {data.circulars.length === 0 ? (
              <EmptyState icon={Megaphone} title="No circulars yet" className="py-10" />
            ) : (
              <ul className="divide-y">
                {data.circulars.map((c: Record<string, any>) => (
                  <li key={c.id}>
                    <Link to="/portal/circulars/$id" params={{ id: String(c.id) }} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                      <span className={cn('size-2 shrink-0 rounded-full', c.isRead ? 'bg-transparent' : 'bg-primary')} aria-label={c.isRead ? undefined : 'Unread'} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm', c.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{c.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          {date(c.publishedAt)}
                          {c.letterNo && <span className="font-mono"> · {c.letterNo}</span>}
                        </span>
                      </span>
                      {Boolean(c.hasAttachment) && <Paperclip className="size-3.5 text-muted-foreground" />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Next leave" />
          <CardBody>
            {next ? (
              <div className="space-y-3">
                <Badge tone={next.status === 'GRANTED' ? 'success' : 'warning'}>{MY_LEAVE_LABELS[next.status] ?? next.status}</Badge>
                <p className="text-lg font-bold text-slate-900">
                  {date(next.startDate)} – {date(next.endDate)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {num(next.approvedDays)} days of {String(next.type ?? '').toLowerCase()} leave · resume {date(next.resumeDate)}
                </p>
              </div>
            ) : (
              <EmptyState icon={CalendarDays} title="No leave coming up" description="Plan your annual leave early so your head can arrange cover." className="py-6" />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
