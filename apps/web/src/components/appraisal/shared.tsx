// Pieces shared by the staff and head appraisal pages.
import { cn } from '@hrms/ui'
import { APPRAISAL_RATINGS } from '#/lib/schemas'
import { date } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DetailList } from '#/components/admin/page'

type R = Record<string, any>
export type RatingCode = keyof typeof APPRAISAL_RATINGS

export const RATING_CODES = Object.keys(APPRAISAL_RATINGS) as Array<RatingCode>
const RATING_STYLES: Record<string, string> = {
  U: 'bg-secondary-light text-secondary-light-foreground',
  S: 'bg-warning-light text-warning-light-foreground',
  X: 'bg-slate-100 text-slate-700',
  A: 'bg-primary-soft text-primary',
  E: 'bg-success-soft text-emerald-700',
}
export const OVERALL_LABELS: Record<string, string> = { Unsatisfactory: 'Unsatisfactory', satisfactory: 'Satisfactory', Successful: 'Successful', 'Above Expectations': 'Above expectations', Exceptional: 'Exceptional' }

export function RatingChip({ code }: { code: string | null }) {
  if (!code) return <span className="text-xs text-muted-foreground">Not rated</span>
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', RATING_STYLES[code])}>{APPRAISAL_RATINGS[code as RatingCode] ?? code}</span>
}

export function FormAStatus({ status }: { status: number | null | undefined }) {
  if (!status) return <Badge>Not started</Badge>
  return status >= 2 ? <Badge tone="success">Signed by both</Badge> : <Badge tone="warning">Waiting for the staff member</Badge>
}
export function FormBStatus({ status }: { status: number | null | undefined }) {
  if (!status) return <Badge>Not submitted</Badge>
  return status >= 2 ? <Badge tone="success">Countersigned</Badge> : <Badge tone="warning">Waiting for countersignature</Badge>
}

/** Form A as written: header, ratings by category, summary and sign-offs. */
export function FormAView({ form }: { form: R }) {
  const cats = new Map<string, Array<R>>()
  for (const a of form.answers as Array<R>) {
    const key = a.catName ?? 'Other'
    if (!cats.has(key)) cats.set(key, [])
    cats.get(key)!.push(a)
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title={`Appraisal ${form.year} · Form A`} description={form.purpose || undefined} />
        <CardBody>
          <DetailList
            columns={3}
            items={[
              ['Supervisor', form.supervisorName],
              ['Supervisor’s rank', form.supervisorsRank],
              ['Overall rating', OVERALL_LABELS[form.supRating] ?? form.supRating],
              ['Completed', date(form.supSignedAt)],
              ['Signed by staff', form.empSignedAt ? date(form.empSignedAt) : form.status >= 2 ? 'Yes' : 'Not yet'],
            ]}
          />
        </CardBody>
      </Card>
      {[...cats.entries()].map(([cat, answers]) => (
        <Card key={cat}>
          <CardHeader title={cat} />
          <ul className="divide-y">
            {answers.map((a) => (
              <li key={a.questionId} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5 px-5 py-3">
                <span className="min-w-0 flex-1 text-sm text-slate-700">
                  {a.question}
                  {a.example && <span className="mt-1 block text-xs text-muted-foreground">Example: {a.example}</span>}
                </span>
                <RatingChip code={a.rating} />
              </li>
            ))}
          </ul>
        </Card>
      ))}
      <Card>
        <CardHeader title="Summary" />
        <CardBody className="space-y-4 text-sm">
          <Block label="Current year objectives" text={form.currYearObj} />
          <Block label="Development needs" text={form.devNeeds} />
          <Block label="Overall summary" text={form.overallSummary} />
          <Block label="Staff member’s comments" text={form.empComments} />
        </CardBody>
      </Card>
    </div>
  )
}

export function FormBView({ form }: { form: R }) {
  return (
    <Card>
      <CardHeader title={`Self-appraisal ${form.year} · Form B`} description={`Submitted ${date(form.submittedAt)}${form.supSignedAt ? ` · countersigned ${date(form.supSignedAt)}` : ''}`} />
      <CardBody className="space-y-4 text-sm">
        <DetailList items={[['Supervisor', form.supervisorName], ['Supervisor’s rank', form.supervisorsRank]]} />
        <Block label="Main accomplishments" text={form.accomplishments} />
        <Block label="Barriers and challenges" text={form.barriersChallenges} />
        <Block label="How the barriers affected your goals" text={form.barriersChallengesGoal} />
        <Block label="Strengths and areas to improve" text={form.strengthImprovement} />
        <Block label="New knowledge and skills gained" text={form.newKnowledge} />
        <Block label="Other information" text={form.otherInformation} />
      </CardBody>
    </Card>
  )
}

function Block({ label, text }: { label: string; text: string | null | undefined }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="break-words whitespace-pre-line text-slate-700">{text || '—'}</p>
    </div>
  )
}
