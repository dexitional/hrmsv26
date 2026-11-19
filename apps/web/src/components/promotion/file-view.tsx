// A promotion or contract-renewal file as both the applicant and the heads
// see it: the application, the dossier, the documents and the trail.
import { Check, ExternalLink, FileText, Link2 } from 'lucide-react'
import { cn } from '@hrms/ui'
import { date, dateTime } from '#/lib/format'
import { properName } from '#/lib/text-case'
import { Badge } from '#/components/ui/badge'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DetailList } from '#/components/admin/page'
import { PROMOTION_DETAIL_FIELDS } from '#/lib/schemas'
import { DETAIL_LABELS, TYPE_LABELS } from './labels'

type R = Record<string, any>
const STEPS = ['Head of department', 'Dean / Director', 'Provost / Registrar', 'HR', 'Assessors', 'A&P board', 'Decision']

export function StateBadge({ state }: { state: { label: string; tone: 'neutral' | 'warning' | 'info' | 'danger' | 'success' } }) {
  return <Badge tone={state.tone}>{state.label}</Badge>
}

export function Stepper({ level, stage }: { level: number; stage: number }) {
  const final = level >= 7
  return (
    <ol className="grid grid-cols-4 gap-y-4 sm:grid-cols-7">
      {STEPS.map((step, i) => {
        const n = i + 1
        const done = n < level || (final && n === 7)
        const now = n === level && !final
        const flagged = now && [2, 8, 9, 10, 11, 13].includes(stage)
        return (
          <li key={step} className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold',
                done ? 'border-primary bg-primary text-white' : flagged ? 'border-amber-400 bg-warning-light text-warning-light-foreground' : now ? 'border-primary bg-white text-primary' : 'border-slate-200 bg-white text-slate-400',
              )}
            >
              {done ? <Check className="size-3.5" /> : n}
            </span>
            <span className={cn('text-[0.7rem] leading-tight', now ? 'font-bold text-primary' : 'text-muted-foreground')}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** A document link through the portal (so heads can open it), or a note when missing. */
export function DocLink({ path, label, href }: { path: string | null | undefined; label: string; href: (path: string) => string }) {
  if (!path) return <span className="text-sm text-muted-foreground">{label}: not uploaded</span>
  return (
    <a href={href(path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      <FileText className="size-4" /> {label}
      {!path.startsWith('/api/files/') && <span className="text-xs font-normal text-muted-foreground">(old portal)</span>}
    </a>
  )
}

export function FileView({ file, docHref }: { file: R; docHref: (path: string) => string }) {
  const d = (file.details ?? {}) as R
  const filled = PROMOTION_DETAIL_FIELDS.filter((k) => d[k])
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Where it is" description={file.state?.label} />
        <CardBody>
          <Stepper level={Number(file.promoStatus)} stage={Number(file.stageStatus)} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="lg:col-span-2">
          <CardHeader title="Application" />
          <CardBody>
            <DetailList
              items={[
                ['Applicant', `${file.fullName} (${file.staffNo})`],
                ['Unit', properName(file.unitName)],
                ['Application', TYPE_LABELS[Number(file.type)] ?? 'Application'],
                ['Type of promotion', properName(file.promoComments)],
                ['Current rank', properName(file.currentRank)],
                ['Rank applied for', properName(file.appliedRank)],
                ['Submitted', date(file.submittedAt ?? file.activityDate, 'long')],
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Documents" />
          <CardBody className="flex flex-col items-start gap-2.5">
            <DocLink path={file.appLetter ?? d.appLetter} label="Application letter / form" href={docHref} />
            <DocLink path={file.promoDoc1 ?? d.appCv} label="Curriculum vitae" href={docHref} />
            {(file.promoDoc2 || d.papers) && <DocLink path={file.promoDoc2 || d.papers} label="Papers" href={docHref} />}
          </CardBody>
        </Card>
      </div>

      {file.papers?.length > 0 && (
        <Card>
          <CardHeader title={`Papers (${file.papers.length})`} />
          <ul className="divide-y">
            {(file.papers as Array<R>).map((p, i) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="mr-2 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                  {p.title}
                  {p.link && (
                    <a href={/^https?:/.test(p.link) ? p.link : `https://doi.org/${p.link}`} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline">
                      <Link2 className="size-3" /> {p.link}
                    </a>
                  )}
                </span>
                {p.file && <DocLink path={p.file} label="PDF" href={docHref} />}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {filled.length > 0 && (
        <Card>
          <CardHeader title="Dossier" />
          <CardBody className="space-y-4">
            {filled.map((k) => (
              <div key={k}>
                <p className="eyebrow mb-1">{DETAIL_LABELS[k].label}</p>
                {/<[a-z][\s\S]*>/i.test(String(d[k])) ? (
                  <div className="prose-sm max-w-none overflow-x-auto text-sm text-slate-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: d[k] }} />
                ) : (
                  <p className="text-sm break-words whitespace-pre-line text-slate-700">{d[k]}</p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Trail" description="Every step taken on this file" />
        <CardBody>
          {!file.trail?.length ? (
            <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
              {(file.trail as Array<R>).map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-white" />
                  <p className="text-sm font-semibold text-slate-800">{t.stageActivity}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateTime(t.activityDate)}
                    {t.actorName && ` · ${properName(t.actorName)}`}
                  </p>
                  {t.comments && t.comments !== t.stageActivity && <p className="mt-1 text-sm break-words text-slate-600">{t.comments}</p>}
                  {t.stageFile && (
                    <a href={docHref(t.stageFile)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <ExternalLink className="size-3" /> Attached document
                    </a>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
