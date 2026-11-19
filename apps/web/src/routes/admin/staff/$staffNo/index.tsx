import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeftRight,
  CalendarDays,
  CalendarClock,
  Crown,
  FileText,
  Gavel,
  GraduationCap,
  HeartHandshake,
  Landmark,
  LayoutGrid,
  Mail,
  Pencil,
  Phone,
  Printer,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { api } from '#/lib/api-client'
import { addYears, date, dateTime, genderLabel, num } from '#/lib/format'
import { DOC_LABELS, ELEVATION_LABELS, GROUP_LABELS, MARITAL_LABELS } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '#/components/ui/dropdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  AgeBadge,
  Avatar,
  DeadlineBadge,
  DetailList,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { BanksTab } from '#/components/staff/banks'
import { QualificationsTab } from '#/components/staff/qualifications'
import { RelativesTab } from '#/components/staff/relatives'

const TABS = ['overview', 'relatives', 'bank', 'qualifications'] as const

export const Route = createFileRoute('/admin/staff/$staffNo/')({
  validateSearch: z.object({ tab: z.enum(TABS).optional() }),
  component: StaffProfile,
})

type R = Record<string, any>

function MiniTable({ head, rows, empty }: { head: Array<string>; rows: Array<Array<React.ReactNode>>; empty: string }) {
  if (!rows.length) return <EmptyState title={empty} className="py-10" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b bg-slate-50/70">
            {head.map((h) => (
              <th key={h} className="eyebrow px-4 py-2.5 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2.5 align-middle">
                  {c ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StaffProfile() {
  const { staffNo } = Route.useParams()
  const { tab = 'overview' } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const canEdit = useCan('staff', 'edit')
  const {
    data: s,
    isLoading,
    error,
  } = useQuery({ queryKey: ['staff', staffNo], queryFn: () => api.get<R>(`/staff/${staffNo}`) })
  if (isLoading) return <ProfileSkeleton />
  if (error || !s) return <EmptyState title="Staff member not found" description={(error as Error)?.message} />
  const leave = s.leave as R
  const docs = s.docs as Array<R>
  const retirement = s.dob ? addYears(s.dob, 60) : null
  return (
    <>
      <PageHeader
        back={{ to: '/admin/staff', label: 'Staff' }}
        eyebrow={`Staff ${s.staffNo}`}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={s.fullName} staffNo={s.staffNo} className="size-16 text-lg ring-4 ring-secondary" />
            <span>
              {s.fullName}
              <span className="mt-1 block text-sm font-medium text-muted-foreground">
                {s.jobTitle ?? 'No designation'} · {s.unitName ?? 'No unit'}
              </span>
            </span>
          </span>
        }
        meta={
          <>
            <StatusBadge status={s.staffStatus} />
            {s.curStaffGroup && (
              <Badge tone="brand" dot={false}>
                {GROUP_LABELS[s.curStaffGroup]}
              </Badge>
            )}
            <AgeBadge age={s.age} />
            {Number(s.flagLeave) === 1 && <Badge tone="info">On leave</Badge>}
            {Number(s.flagLeave) === 2 && <Badge tone="info">Relieving a colleague</Badge>}
            {s.uccMail && (
              <a
                href={`mailto:${s.uccMail}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <Mail className="size-3.5" /> {s.uccMail}
              </a>
            )}
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <Phone className="size-3.5" /> {s.phone}
              </a>
            )}
          </>
        }
        actions={
          <>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline">
                  <Printer /> Print
                </Button>
              </DropdownTrigger>
              <DropdownContent className="w-60">
                <DropdownItem onSelect={() => window.open(`/print/staff/${s.staffNo}`, '_blank')}>
                  <UserRound /> Full staff profile
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onSelect={() => window.open(`/print/elevation/${s.staffNo}`, '_blank')}>
                  <TrendingUp /> Appointment & promotion statistics
                </DropdownItem>
                <DropdownItem onSelect={() => window.open(`/print/leave/${s.staffNo}`, '_blank')}>
                  <CalendarDays /> Leave statistics
                </DropdownItem>
                <DropdownItem onSelect={() => window.open(`/print/transfers/${s.staffNo}`, '_blank')}>
                  <ArrowLeftRight /> Transfer history
                </DropdownItem>
                <DropdownItem onSelect={() => window.open(`/print/positions/${s.staffNo}`, '_blank')}>
                  <Crown /> Position history
                </DropdownItem>
                <DropdownItem onSelect={() => window.open(`/print/disciplinary/${s.staffNo}`, '_blank')}>
                  <Gavel /> Disciplinary record
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
            {canEdit && (
              <Button asChild>
                <Link to="/admin/staff/$staffNo/edit" params={{ staffNo }}>
                  <Pencil /> Edit
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(t) =>
          navigate({ search: { tab: t === 'overview' ? undefined : (t as (typeof TABS)[number]) } })
        }
      >
        <TabsList className="mb-5">
          <TabsTrigger value="overview">
            <LayoutGrid /> Overview
          </TabsTrigger>
          <TabsTrigger value="relatives">
            <HeartHandshake /> Relatives
          </TabsTrigger>
          <TabsTrigger value="bank">
            <Landmark /> Bank info
          </TabsTrigger>
          <TabsTrigger value="qualifications">
            <GraduationCap /> Qualifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border bg-white p-4">
              <p className="eyebrow">
                Current {ELEVATION_LABELS[s.currentType ?? 'APPOINTMENT']?.toLowerCase() ?? 'appointment'}
              </p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{date(s.currentSince)}</p>
              <p className="text-xs text-muted-foreground">
                {s.grade ? `Grade ${s.grade} · Notch ${s.notch}` : 'No grade recorded'}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <p className="eyebrow">Annual leave {leave?.year}</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {num(leave?.remaining)}{' '}
                <span className="text-sm font-medium text-muted-foreground">of {num(leave?.total)} days left</span>
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-chart-single"
                  style={{
                    width: `${Math.min(100, ((Number(leave?.used) + Number(leave?.pending ?? 0)) / Math.max(1, Number(leave?.total))) * 100)}%`,
                  }}
                />
              </div>
              {(leave?.pending > 0 || leave?.note) && (
                <p className="mt-1.5 text-xs text-muted-foreground">{leave?.note ?? `${num(leave?.pending)} days in pending applications`}</p>
              )}
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <p className="eyebrow">Retirement</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">{date(retirement)}</p>
              <p className="text-xs text-muted-foreground">At age 60 · born {date(s.dob)}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <p className="eyebrow">Service</p>
              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {s.firstAppointDate && !String(s.firstAppointDate).startsWith('0000')
                  ? `${Math.max(0, new Date().getFullYear() - Number(String(s.firstAppointDate).slice(0, 4)))} years`
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">First appointed {date(s.firstAppointDate)}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4">
              <Card>
                <CardHeader title="Personal information" />
                <CardBody>
                  <DetailList
                    columns={1}
                    items={[
                      ['Gender', genderLabel(s.gender)],
                      ['Date of birth', date(s.dob, 'long')],
                      ['Marital status', s.mstatus ? MARITAL_LABELS[s.mstatus] : null],
                      ['Hometown', s.hometown],
                      ['District / region', [s.district, s.region].filter(Boolean).join(', ')],
                      ['Nationality', s.nationality ?? s.country],
                      ['Personal email', s.email],
                      ['Permanent address', s.paddress],
                      ['Residential address', s.address],
                    ]}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Emergency contact" />
                <CardBody>
                  <DetailList
                    columns={1}
                    items={
                      s.emergencyName || s.emergencyPhone
                        ? [
                            ['Name', s.emergencyName],
                            ['Relation', s.emergencyRelation],
                            ['Phone', s.emergencyPhone],
                            ['Address', s.emergencyAddress],
                          ]
                        : [['Contact', s.emergencyContact]]
                    }
                  />
                </CardBody>
              </Card>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader title="University information" />
                <CardBody>
                  <DetailList
                    columns={3}
                    items={[
                      ['Staff number', <span className="font-mono">{s.staffNo}</span>],
                      ['University email', s.uccMail],
                      ['Phone', s.phone],
                      ['SSNIT number', s.ssnit],
                      ['Ghana Card', s.ghanaCardNo],
                      ['Status', <StatusBadge status={s.staffStatus} />],
                      ['Designation', s.jobTitle],
                      ['Unit', s.unitName],
                      ['Category', s.curStaffGroup ? `${s.curStaffGroup} – ${GROUP_LABELS[s.curStaffGroup]}` : null],
                      ['Appointment date', date(s.firstAppointDate)],
                      ['Assumption date', date(s.assumeDate)],
                      ['Probation', s.probation ? `${s.probation} year${s.probation > 1 ? 's' : ''}` : null],
                      ['Confirmation date', date(s.confirmDate)],
                      ['Grade / notch', s.grade ? `${s.grade} · ${s.notch}` : null],
                      ['Exit', s.exitDate ? `${date(s.exitDate)}${s.exitRemark ? ` — ${s.exitRemark}` : ''}` : null],
                    ]}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Personal documents" />
                <CardBody className="grid gap-2 sm:grid-cols-2">
                  {(['MARITAL', 'BIRTH', 'MEDICAL', 'CV'] as const).map((cat) => {
                    const d = docs.find((x) => x.category === cat)
                    const ok = d?.path?.startsWith('/api/files/')
                    return (
                      <div key={cat} className="flex items-center gap-3 rounded-xl border p-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <FileText className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800">{DOC_LABELS[cat]}</span>
                          {d ? (
                            ok ? (
                              <a
                                href={d.path}
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-xs text-primary hover:underline"
                              >
                                {d.title}
                              </a>
                            ) : (
                              <span className="block truncate text-xs text-muted-foreground">
                                Legacy file (staff portal)
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">Not uploaded</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </CardBody>
              </Card>
            </div>
          </div>

          <Card className="mt-4 overflow-hidden">
            <Tabs defaultValue="elevation">
              <TabsList className="px-3">
                <TabsTrigger value="elevation">
                  <TrendingUp /> Elevation ({s.elevations.length})
                </TabsTrigger>
                <TabsTrigger value="transfers">
                  <ArrowLeftRight /> Transfers ({s.transfers.length})
                </TabsTrigger>
                <TabsTrigger value="positions">
                  <Crown /> Positions ({s.positions.length})
                </TabsTrigger>
                <TabsTrigger value="leave">
                  <CalendarDays /> Recent leave
                </TabsTrigger>
                <TabsTrigger value="contracts">
                  <FileText /> Contracts
                </TabsTrigger>
                <TabsTrigger value="dob">
                  <CalendarClock /> DOB changes ({s.dobLog.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="elevation">
                <MiniTable
                  empty="No appointment records"
                  head={['Type', 'Date', 'Designation', 'Grade', 'Unit', 'Confirmed', '']}
                  rows={s.elevations.map((e: R) => [
                    <StatusBadge status={e.applyType ?? 'APPOINTMENT'} />,
                    date(e.appointDate),
                    <span className="text-xs font-medium">{e.jobTitle}</span>,
                    e.grade ? `${e.grade} · ${e.notch}` : '—',
                    <span className="text-xs">{e.unitName}</span>,
                    date(e.confirmDate),
                    e.isCurrent ? <Badge tone="success">Current</Badge> : null,
                  ])}
                />
              </TabsContent>
              <TabsContent value="transfers">
                <MiniTable
                  empty="No transfers"
                  head={['Date', 'From', 'To', 'Reason']}
                  rows={s.transfers.map((t: R) => [
                    date(t.transferDate),
                    <span className="text-xs">{t.fromUnitName}</span>,
                    <span className="text-xs font-medium">{t.toUnitName}</span>,
                    <span className="text-xs">{t.reason}</span>,
                  ])}
                />
              </TabsContent>
              <TabsContent value="positions">
                <MiniTable
                  empty="No positions held"
                  head={['Position', 'Unit', 'Period', 'Cycle']}
                  rows={s.positions.map((p: R) => [
                    <span className="font-medium">{p.title}</span>,
                    <span className="text-xs">{p.unitName}</span>,
                    <span className="text-xs">
                      {date(p.startDate)} – {date(p.endDate)}
                    </span>,
                    p.active === '1' ? <DeadlineBadge daysLeft={p.daysLeft} /> : <Badge>Ended</Badge>,
                  ])}
                />
              </TabsContent>
              <TabsContent value="leave">
                <MiniTable
                  empty="No leave records"
                  head={['Type', 'Start', 'End', 'Days', 'Status']}
                  rows={s.leaves.map((l: R) => [
                    l.type,
                    date(l.startDate),
                    date(l.endDate),
                    l.approvedDays,
                    <StatusBadge status={l.status} />,
                  ])}
                />
              </TabsContent>
              <TabsContent value="contracts">
                <MiniTable
                  empty="No contract renewals or post-retirement contracts"
                  head={['Contract', 'Start', 'End', 'Years', 'Status']}
                  rows={[
                    ...s.renewals.map((r: R) => [
                      'SM renewal',
                      date(r.startDate),
                      date(r.endDate),
                      r.renewalPeriod,
                      r.active === '1' ? <Badge tone="success">Current</Badge> : <Badge>Past</Badge>,
                    ]),
                    ...s.postRetire.map((r: R) => [
                      'Post-retirement',
                      date(r.startPost),
                      date(r.endPost),
                      r.served,
                      r.active === '1' ? <Badge tone="success">Current</Badge> : <Badge>Past</Badge>,
                    ]),
                  ]}
                />
              </TabsContent>
              <TabsContent value="dob">
                <MiniTable
                  empty="The date of birth has never been changed"
                  head={['When', 'From', 'To', 'Reason', 'By']}
                  rows={s.dobLog.map((l: R) => [
                    dateTime(l.createdAt),
                    date(l.oldDob),
                    date(l.newDob),
                    <span className="text-xs">{l.reason}</span>,
                    l.changedByName,
                  ])}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </TabsContent>
        <TabsContent value="relatives">
          <Card className="overflow-hidden">
            <RelativesTab staffNo={staffNo} />
          </Card>
        </TabsContent>
        <TabsContent value="bank">
          <Card className="overflow-hidden">
            <BanksTab staffNo={staffNo} />
          </Card>
        </TabsContent>
        <TabsContent value="qualifications">
          <Card className="overflow-hidden">
            <QualificationsTab staffNo={staffNo} />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
