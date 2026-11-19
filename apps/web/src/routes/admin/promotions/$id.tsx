// A promotion / appointment application, laid out like a staff profile
// (after the akaweb directory profile): a cover band with the applicant's
// portrait, a stats-and-actions bar, the approval journey, then the
// application in titled sections.
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CornerUpLeft,
  FileText,
  Forward,
  GraduationCap,
  Hash,
  Home,
  Mail,
  Mic,
  Phone,
  Printer,
  ThumbsDown,
  TrendingUp,
  UserRoundSearch,
  X,
} from 'lucide-react'
import { cn } from '@hrms/ui'
import { PROMOTION_LEVELS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { date, dateTime, relative } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { EmptyState, uccPhotoUrl } from '#/components/admin/page'
import { DocButton, PdfViewer } from '#/components/admin/pdf-viewer'
import { useCan } from '#/components/admin/session'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { ActionDialog } from '#/components/promotions/action-dialog'
import type { Action } from '#/components/promotions/action-dialog'
import { legacyFile } from '#/components/promotions/form-sections'
import { LevelBadge } from '#/components/promotions/level-badge'

export const Route = createFileRoute('/admin/promotions/$id')({ component: ApplicationPage })

type R = Record<string, any>
const JOURNEY = [0, 1, 2, 3, 4, 5, 6, 7]

// ---------------------------------------------------------------- Building blocks

function initials(name: string) {
  const parts = name
    .replace(/^((Rev\.?|Prof\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|\(Mrs\.\))\s*)+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase() || '?'
}

/** Large portrait: initials as SVG text, with the UCC staff photo on top when it loads. */
function Portrait({ name, staffNo }: { name: string; staffNo: number | string }) {
  const [failed, setFailed] = useState(false)
  const src = uccPhotoUrl(staffNo)
  return (
    <div className="relative size-36 overflow-hidden rounded-2xl bg-primary-soft text-primary shadow-[0_10px_34px_rgb(15_23_42/0.25)] ring-4 ring-white sm:size-48">
      <svg className="size-full select-none" viewBox="0 0 100 100" aria-hidden="true">
        <text x="50" y="50" dy=".35em" textAnchor="middle" fontSize="38" fontWeight="700" fill="currentColor">
          {initials(name)}
        </text>
      </svg>
      {src && !failed && (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover object-top"
        />
      )}
    </div>
  )
}

function SectionHeading({ children, aside, id }: { children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-4 flex scroll-mt-6 items-baseline gap-3 text-lg font-extrabold tracking-tight text-primary">
      {children}
      <span className="rule flex-1" />
      {aside}
    </h2>
  )
}

function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-2xl border border-border bg-white', className)}>{children}</div>
}

/** Rich text from the staff portal, clamped with a "Read more" toggle when long. */
function Rich({ html, clampAt = 1200 }: { html: string | null | undefined; clampAt?: number }) {
  const [open, setOpen] = useState(false)
  if (!html) return <p className="text-sm text-muted-foreground">Not provided.</p>
  const long = html.length > clampAt
  return (
    <div>
      <div className={cn('relative', long && !open && 'max-h-72 overflow-hidden')}>
        <div className="report-content overflow-x-auto [&_table]:w-full [&_td]:py-1 [&_td]:pr-3 [&_td]:align-top" dangerouslySetInnerHTML={{ __html: html }} />
        {long && !open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />}
      </div>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          {open ? 'Show less' : 'Read more'} <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}

function SubHeading({ icon: Icon, children }: { icon: typeof Award; children: ReactNode }) {
  return (
    <h3 className="eyebrow mb-3 flex items-center gap-2 text-muted-foreground">
      <Icon className="size-3.5 text-secondary-foreground" /> {children}
    </h3>
  )
}

const sentence = (s: string | null | undefined) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '')

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      <span className="font-mono font-bold text-primary tabular-nums">{value}</span> {label}
    </span>
  )
}

// ---------------------------------------------------------------- Page

function ApplicationPage() {
  const { id } = Route.useParams()
  const canEdit = useCan('promotions', 'edit')
  const canManage = useCan('promotions', 'manage')
  const [action, setAction] = useState<Action | null>(null)
  const [pdf, setPdf] = useState<{ url: string; title: string } | null>(null)
  const { data: a, isLoading } = useQuery({ queryKey: ['promotion', id], queryFn: () => api.get<R>(`/promotions/applications/${id}`) })
  if (isLoading) return <ProfileSkeleton />
  if (!a) return <EmptyState title="Application not found" />

  const level = Number(a.promoStatus)
  const returned = Number(a.stageStatus) >= 10
  const closed = level === 8 || Boolean(a.effectedPromoId)
  const form = (a.form ?? {}) as R
  const staff = (a.staff ?? {}) as R
  const papers = (a.papers as Array<R>).filter((p) => p.title?.trim())
  const activities = a.activities as Array<R>
  const lastActivity = activities.at(-1)?.activityDate ?? a.updatedAt ?? a.submittedAt
  const daysInProcess = a.submittedAt
    ? Math.max(0, Math.round((Date.now() - new Date(String(a.submittedAt).replace(' ', 'T')).getTime()) / 86_400_000))
    : null
  // Where a disapproved application stopped: the furthest level it reached.
  const stoppedAt = Math.min(7, Math.max(0, ...activities.map((x) => Number(x.promoStatus)).filter((n) => n < 8)))
  const isReturn = (x: R) => Boolean(Number(x.returned)) || /^(re-submit|reverse)/i.test(x.stageActivity ?? '')
  const returns = activities.filter(isReturn).length
  const docs: Array<[string, string | null]> = [
    ['Application letter', a.appLetter || form.appLetter],
    ['Application form', a.applyForm],
    ['Curriculum vitae', form.appCv],
    ['Supporting document', a.promoDoc1],
    ['Supporting document 2', a.promoDoc2],
  ]

  return (
    <div className="-mx-6 -mt-6 max-md:-mx-4 lg:-mr-20">
      <PdfViewer url={pdf?.url ?? null} title={pdf?.title ?? ''} onClose={() => setPdf(null)} />
      <ActionDialog app={a} action={action} onClose={() => setAction(null)} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 border-b border-border bg-slate-50/70 px-6 py-3 text-sm max-md:px-4 lg:pr-20" aria-label="Breadcrumb">
        <Link to="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
          <Home className="size-3.5" /> Dashboard
        </Link>
        <ChevronRight className="size-3.5 text-subtle-foreground" />
        <Link to="/admin/promotions" className="text-muted-foreground hover:text-primary">
          Appointment &amp; Promotion
        </Link>
        <ChevronRight className="size-3.5 text-subtle-foreground" />
        <span className="font-semibold text-primary">Application #{a.id}</span>
      </nav>

      {/* Cover band */}
      <section>
        <div className="profile-cover relative h-40 overflow-hidden sm:h-52">
          <div className="dot-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <TrendingUp className="absolute -right-6 -bottom-10 size-56 text-white/10" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-10 bg-[url('/adinkra.png')] bg-[length:auto_40px] bg-bottom-left bg-repeat-x opacity-20 brightness-0 invert"
          />
          <div className="absolute top-4 right-6 flex flex-wrap justify-end gap-2 max-md:right-4 lg:right-24">
            <span className="glass-pill rounded-full px-3 py-1 text-xs font-semibold">{a.typeLabel} application</span>
            {a.type === 0 && a.promoComments && (
              <span className="glass-pill rounded-full px-3 py-1 text-xs font-semibold capitalize">{a.promoComments.toLowerCase()}</span>
            )}
          </div>
        </div>

        <div className="px-6 max-md:px-4 lg:pr-26">
          <div className="rise-1 -mt-20 sm:-mt-28">
            <div className="relative inline-block">
              <Portrait name={a.fullName ?? 'Applicant'} staffNo={a.staffNo} />
              <span className="absolute -right-3 -bottom-2 flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                <span className={cn('fresh-dot size-2 rounded-full', closed ? 'bg-slate-400' : 'bg-primary')} />
                Updated {relative(lastActivity)}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="rise-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-3xl leading-[1.05] font-extrabold tracking-tight text-primary sm:text-[2.6rem]">{a.fullName}</h1>
              <LevelBadge level={level} stageStatus={Number(a.stageStatus)} />
              {a.effectedPromoId && (
                <Badge tone="success" dot={false}>
                  <BadgeCheck className="size-3.5" /> Effected
                </Badge>
              )}
            </div>
            <p className="rise-3 mt-2 flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
              <span>{a.currentTitle ?? staff.jobTitle ?? '—'}</span>
              <ArrowRight className="size-4 text-secondary-foreground" />
              <span className="font-bold text-primary">{a.positionTitle ?? '—'}</span>
              {staff.staffGroup && (
                <span>
                  <span className="opacity-40">·</span> {GROUP_LABELS[staff.staffGroup]}
                </span>
              )}
            </p>
            <p className="rise-3 mt-1 flex items-center gap-1.5 text-base text-muted-foreground">
              <Building2 className="size-4" /> {form.dept || a.unitName || staff.unitName || 'No unit'}
              {form.college && <span className="hidden text-sm opacity-70 lg:inline">· {form.college}</span>}
            </p>
            <div className="rise-4 mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <Link to="/admin/staff/$staffNo" params={{ staffNo: String(a.staffNo) }} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                <Hash className="size-3.5" /> Staff {a.staffNo}
              </Link>
              {(staff.uccMail || form.email) && (
                <a href={`mailto:${staff.uccMail || form.email}`} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                  <Mail className="size-3.5" /> {staff.uccMail || form.email}
                </a>
              )}
              {(staff.phone || form.tel) && (
                <a href={`tel:${staff.phone || form.tel}`} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                  <Phone className="size-3.5" /> {staff.phone || form.tel}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats & actions bar */}
      <div className="mt-6 px-6 max-md:px-4 lg:pr-26">
        <Surface className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
          <Stat value={date(a.submittedAt)} label="submitted" />
          {daysInProcess !== null && <Stat value={daysInProcess} label={`day${daysInProcess === 1 ? '' : 's'} in process`} />}
          <Stat value={activities.length} label="actions" />
          {returns > 0 && <Stat value={returns} label={returns === 1 ? 'return' : 'returns'} />}
          <Stat value={papers.length} label={papers.length === 1 ? 'paper' : 'papers'} />
          <span className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto">
            <Button size="sm" variant="outline" onClick={() => window.open(`/print/promotion/${a.id}`, '_blank')}>
              <Printer /> Print
            </Button>
            {canEdit && !closed && (
              <>
                <Button size="sm" variant="outline" onClick={() => setAction('return')}>
                  <CornerUpLeft /> Return
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAction('assessors')}>
                  <UserRoundSearch /> Assessors
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAction('disapprove')}>
                  <ThumbsDown /> Disapprove
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setAction('advance')}>
                  <Forward /> Move forward
                </Button>
                {canManage && a.type !== 1 && (
                  <Button size="sm" onClick={() => setAction('effect')}>
                    <BadgeCheck /> Approve &amp; effect
                  </Button>
                )}
              </>
            )}
          </span>
        </Surface>
      </div>

      <div className="space-y-10 px-6 pt-10 pb-6 max-md:px-4 lg:pr-26">
        {/* Approval journey */}
        <section>
          <SectionHeading aside={a.hrStepLabel && <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">HR step {a.hrStep} · {a.hrStepLabel.toLowerCase()}</span>}>
            Approval journey
          </SectionHeading>
          <Surface className="px-5 py-6">
            <ol className="grid grid-cols-4 gap-y-6 sm:grid-cols-8">
              {JOURNEY.map((l, i) => {
                const done = level > l && level !== 8
                const here = level === l
                const failedHere = level === 8 && l === stoppedAt
                return (
                  <li key={l} className="relative flex flex-col items-center text-center">
                    {i > 0 && (
                      <span
                        className={cn('absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2', done || here ? 'bg-primary' : 'bg-slate-200')}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-[1] flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                        failedHere
                          ? 'border-destructive bg-destructive text-white'
                          : done || (here && l === 7)
                            ? 'border-primary bg-primary text-white'
                            : here
                              ? returned
                                ? 'border-warning bg-warning-light text-warning-light-foreground'
                                : 'fresh-dot border-primary bg-white text-primary'
                              : 'border-slate-200 bg-white text-slate-400',
                      )}
                    >
                      {failedHere ? <X className="size-4" /> : done || (here && l === 7) ? <Check className="size-4" /> : l + 1}
                    </span>
                    <span className={cn('mt-2 px-1 text-[0.7rem] leading-tight', done || here ? 'font-semibold text-slate-800' : 'text-muted-foreground')}>
                      {PROMOTION_LEVELS[l]}
                    </span>
                  </li>
                )
              })}
            </ol>
            <div
              className={cn(
                'mt-6 flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm',
                level === 8 ? 'bg-secondary-light text-secondary-light-foreground' : returned ? 'bg-warning-light text-warning-light-foreground' : 'bg-primary-soft text-primary',
              )}
            >
              <span className="font-bold">Now:</span>
              {level === 8
                ? 'Disapproved'
                : returned
                  ? `Returned — ${a.stage}`
                  : level === 7
                    ? 'Approved'
                    : `At ${PROMOTION_LEVELS[level]}${a.hrStepLabel ? ` · ${sentence(a.hrStepLabel)}` : ''}`}
              {!returned && level < 7 && activities.at(-1) && (
                <span className="opacity-70">
                  — last action: {activities.at(-1)!.stageActivity?.toLowerCase()} {relative(activities.at(-1)!.activityDate)}
                </span>
              )}
            </div>
          </Surface>
        </section>

        {/* Summary */}
        <section>
          <SectionHeading>At a glance</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Present rank', form.presentRank || a.currentTitle, `Since ${date(form.prEdate)}`],
              ['Applying for', a.positionTitle, a.type === 0 ? sentence(a.promoComments) : a.typeLabel],
              ['First appointed', date(staff.firstAppointDate), staff.firstAppointDate ? `${new Date().getFullYear() - Number(String(staff.firstAppointDate).slice(0, 4))} years' service` : ''],
              ['Other position held', form.presentRankIfany || 'None stated', form.ppEdate ? `Since ${date(form.ppEdate)}` : ''],
            ].map(([label, value, sub]) => (
              <Surface key={label} className="p-4 transition-shadow hover:shadow-md">
                <p className="eyebrow">{label}</p>
                <p className="mt-1.5 text-base font-bold text-slate-900">{value || '—'}</p>
                {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
              </Surface>
            ))}
          </div>
        </section>

        {/* Focus & expertise */}
        {(form.areaSpecialization || form.researchMajorProjects) && (
          <section>
            <SectionHeading>Focus &amp; expertise</SectionHeading>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              <Surface className="p-6">
                <SubHeading icon={GraduationCap}>Area(s) of specialization</SubHeading>
                <Rich html={form.areaSpecialization} />
              </Surface>
              <Surface className="p-6">
                <SubHeading icon={BookOpen}>Research &amp; major projects</SubHeading>
                <Rich html={form.researchMajorProjects} clampAt={600} />
              </Surface>
            </div>
          </section>
        )}

        {/* Background: qualifications | processing journey */}
        <section>
          <SectionHeading>Background &amp; processing</SectionHeading>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="space-y-3">
              <SubHeading icon={GraduationCap}>Education &amp; qualifications</SubHeading>
              {[
                ['First degree(s)', form.firstDegreeDetails],
                ['Postgraduate degree(s)', form.pgDegreeDetails],
                ['Other qualifications', form.otherQualification],
              ]
                .filter(([, html]) => html)
                .map(([label, html]) => (
                  <Surface key={label} className="p-4">
                    <p className="mb-1 text-sm font-bold text-primary">{label}</p>
                    <Rich html={html} clampAt={900} />
                  </Surface>
                ))}
              {!form.firstDegreeDetails && !form.pgDegreeDetails && (
                <Surface className="p-4 text-sm text-muted-foreground">No online application form for this application.</Surface>
              )}
            </div>
            <div>
              <SubHeading icon={TrendingUp}>Processing record</SubHeading>
              <div className="relative pl-6">
                <span className="absolute top-2 bottom-2 left-[5px] w-px bg-border" aria-hidden="true" />
                <ol className="space-y-4">
                  {activities.map((x) => {
                    const back = isReturn(x)
                    const no = Number(x.activity) === 2
                    return (
                      <li key={x.id} className="relative">
                        <span
                          className={cn(
                            'absolute top-1.5 -left-[23px] size-3 rounded-full border-2 border-white ring-1',
                            no ? 'bg-destructive ring-red-200' : back ? 'bg-warning ring-amber-200' : 'bg-primary ring-primary/20',
                          )}
                          aria-hidden="true"
                        />
                        <p className="text-sm leading-snug font-semibold text-slate-900">{x.stageActivity}</p>
                        <p className="text-xs text-muted-foreground">
                          {PROMOTION_LEVELS[Number(x.promoStatus)] ?? ''} · {dateTime(x.activityDate)}
                        </p>
                        {x.comments && <p className="mt-1 line-clamp-4 text-sm whitespace-pre-line text-slate-600">{x.comments}</p>}
                        {(x.userName || x.unitName) && <p className="mt-0.5 text-[11px] text-muted-foreground">{[x.userName, x.unitName].filter(Boolean).join(' · ')}</p>}
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Teaching & duties */}
        {(form.teachingDutiesExperience || form.previousPostDuties) && (
          <section>
            <SectionHeading>Teaching &amp; duties</SectionHeading>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              {form.teachingDutiesExperience && (
                <figure className="min-w-0 border-l-[3px] border-primary pl-5">
                  <Rich html={form.teachingDutiesExperience} clampAt={800} />
                  <figcaption className="eyebrow mt-2">Teaching duties &amp; experience</figcaption>
                </figure>
              )}
              {form.previousPostDuties && (
                <figure className="min-w-0 border-l-[3px] border-secondary-strong pl-5">
                  <Rich html={form.previousPostDuties} clampAt={800} />
                  <figcaption className="eyebrow mt-2">Duties in previous post(s)</figcaption>
                </figure>
              )}
            </div>
          </section>
        )}

        {/* Publications */}
        {(form.publicationsForPreviousPromotion || form.newPublicationSubmitted || papers.length > 0) && (
          <section>
            <SectionHeading aside={papers.length > 0 && <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">{papers.length} paper{papers.length === 1 ? '' : 's'} uploaded</span>}>
              Publications
            </SectionHeading>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              {form.newPublicationSubmitted && (
                <Surface className="p-6">
                  <SubHeading icon={BookOpen}>Submitted for this application</SubHeading>
                  <Rich html={form.newPublicationSubmitted} />
                </Surface>
              )}
              {form.publicationsForPreviousPromotion && (
                <Surface className="p-6">
                  <SubHeading icon={BookOpen}>Submitted for the previous promotion</SubHeading>
                  <Rich html={form.publicationsForPreviousPromotion} />
                </Surface>
              )}
            </div>
            {papers.length > 0 && (
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {papers.map((p, i) => (
                  <li key={p.id} className="flex items-start gap-3 rounded-xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-mono text-xs font-bold text-primary">{i + 1}</span>
                    <span className="min-w-0 text-sm leading-snug font-medium text-slate-800">
                      {p.title}
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer" className="ml-1.5 text-xs font-semibold text-primary hover:underline">
                          link →
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {/* Engagements */}
        {form.conferenceSeminarsEtc && (
          <section>
            <SectionHeading>Engagements</SectionHeading>
            <Surface className="p-6">
              <SubHeading icon={Mic}>Conferences, seminars &amp; workshops</SubHeading>
              <Rich html={form.conferenceSeminarsEtc} />
            </Surface>
          </section>
        )}

        {/* Honors & affiliations */}
        {(form.prizesGrantAward || form.professionalMembershipBodies) && (
          <section>
            <SectionHeading>Honors &amp; affiliations</SectionHeading>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              {form.prizesGrantAward && (
                <Surface className="p-6">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-warning-light text-warning-light-foreground">
                    <Award className="size-4" />
                  </div>
                  <p className="mb-2 text-sm font-bold text-primary">Prizes, grants &amp; awards</p>
                  <Rich html={form.prizesGrantAward} />
                </Surface>
              )}
              {form.professionalMembershipBodies && (
                <Surface className="p-6">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <BadgeCheck className="size-4" />
                  </div>
                  <p className="mb-2 text-sm font-bold text-primary">Membership of professional bodies</p>
                  <Rich html={form.professionalMembershipBodies} />
                </Surface>
              )}
            </div>
          </section>
        )}

        {(form.otherRelevantInfo || form.studAppraisal) && (
          <section>
            <SectionHeading>Other information</SectionHeading>
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              {form.otherRelevantInfo && (
                <Surface className="p-6 lg:col-span-2">
                  <Rich html={form.otherRelevantInfo} />
                </Surface>
              )}
              {form.studAppraisal && (
                <Surface className="p-6">
                  <SubHeading icon={GraduationCap}>Student appraisal</SubHeading>
                  <Rich html={form.studAppraisal} />
                </Surface>
              )}
            </div>
          </section>
        )}

        {/* Documents & assessors */}
        <section>
          <SectionHeading>Documents &amp; assessors</SectionHeading>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {docs
                .filter(([, path]) => path)
                .map(([label, path]) => (
                  <Surface key={label} className="flex items-center gap-3 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <FileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{label}</span>
                      {legacyFile(path) ? (
                        <span className="text-xs text-muted-foreground">Held on the staff portal</span>
                      ) : (
                        <DocButton path={path} onOpen={(url) => setPdf({ url, title: label })} />
                      )}
                    </span>
                  </Surface>
                ))}
              {docs.every(([, path]) => !path) && <Surface className="p-4 text-sm text-muted-foreground sm:col-span-2">No documents attached.</Surface>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(a.assessors as Array<R>).map((x) => (
                <Surface key={x.assessorId} className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-secondary-light text-secondary-light-foreground">
                    <UserRoundSearch className="size-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {x.fname} {x.lname}
                  </p>
                  <p className="text-xs text-muted-foreground">{[x.eduLevel, x.institution].filter(Boolean).join(' · ') || '—'}</p>
                  {x.specialArea && <p className="mt-1 text-xs text-slate-600">{x.specialArea}</p>}
                </Surface>
              ))}
              {a.assessors.length === 0 && (
                <Surface className="flex items-center gap-3 p-4 text-sm text-muted-foreground sm:col-span-2">
                  <UserRoundSearch className="size-4" /> No assessors assigned yet.
                  {canEdit && !closed && (
                    <button type="button" onClick={() => setAction('assessors')} className="ml-auto text-xs font-bold text-primary hover:underline">
                      Assign
                    </button>
                  )}
                </Surface>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
