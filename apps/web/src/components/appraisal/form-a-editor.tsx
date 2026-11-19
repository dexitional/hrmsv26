// Form A, completed by the supervisor: a rating (and optional example) per
// question, grouped by competency, then the summary and the overall rating.
import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { APPRAISAL_RATINGS, OVERALL_RATINGS, REVIEW_PURPOSES, formASchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Card, CardHeader } from '#/components/ui/card'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Field } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { OVERALL_LABELS, RATING_CODES } from './shared'
import type { RatingCode } from './shared'

type R = Record<string, any>
type Answer = { rating: RatingCode | null; example: string }

export function FormAEditor({ staffNo, year, questions, existing, onDone }: { staffNo: number; year: string; questions: Array<R>; existing: R | null; onDone: () => void }) {
  const prior = new Map<number, R>((existing?.answers ?? []).map((a: R) => [a.questionId, a]))
  const [answers, setAnswers] = useState<Record<number, Answer>>(() =>
    Object.fromEntries(
      questions.flatMap((c) => c.questions).map((q: R) => [q.questionId, { rating: (prior.get(q.questionId)?.rating as RatingCode) ?? null, example: prior.get(q.questionId)?.example ?? '' }]),
    ),
  )
  const [purpose, setPurpose] = useState<string>(existing?.purpose || 'Annual Appraisal')
  const [currYearObj, setCurrYearObj] = useState<string>(existing?.currYearObj ?? '')
  const [devNeeds, setDevNeeds] = useState<string>(existing?.devNeeds ?? '')
  const [overallSummary, setOverallSummary] = useState<string>(existing?.overallSummary ?? '')
  const [supRating, setSupRating] = useState<string>(existing?.supRating ?? '')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const total = Object.keys(answers).length
  const rated = Object.values(answers).filter((a) => a.rating).length

  const save = useSave((body: unknown) => api.post(`/portal/manage/appraisals/${staffNo}/${year}/form-a`, body), {
    invalidate: ['portal'],
    success: 'Appraisal completed. The staff member has been asked to comment and sign.',
    onDone,
    onError: setError,
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const body = {
      purpose,
      answers: Object.entries(answers).map(([questionId, a]) => ({ questionId: Number(questionId), rating: a.rating, example: a.example })),
      currYearObj,
      devNeeds,
      overallSummary,
      supRating,
      confirm,
    }
    const parsed = formASchema.safeParse(body)
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Check the form')
    if (rated < total && !window.confirm(`${total - rated} question(s) are not rated. Submit anyway?`)) return
    save.mutate(body)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purpose of this review" required>
            <NativeSelect value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {REVIEW_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="flex flex-wrap items-end gap-1.5 text-xs">
            {RATING_CODES.map((c) => (
              <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                <b>{c}</b> {APPRAISAL_RATINGS[c]}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {questions.map((cat) => (
        <Card key={cat.catId}>
          <CardHeader title={cat.catName} description={`${cat.questions.filter((q: R) => answers[q.questionId]?.rating).length} of ${cat.questions.length} rated`} />
          <ul className="divide-y">
            {cat.questions.map((q: R) => {
              const a = answers[q.questionId]!
              return (
                <li key={q.questionId} className="space-y-2 px-5 py-3.5">
                  <div className="grid grid-cols-1 items-start gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <p className="text-sm text-slate-700">{q.question}</p>
                    <div role="radiogroup" aria-label={q.question} className="flex shrink-0 gap-1">
                      {RATING_CODES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          role="radio"
                          aria-checked={a.rating === code}
                          title={APPRAISAL_RATINGS[code]}
                          onClick={() => setAnswers((s) => ({ ...s, [q.questionId]: { ...a, rating: a.rating === code ? null : code } }))}
                          className={cn(
                            'size-9 rounded-lg border text-sm font-bold transition-colors',
                            a.rating === code ? 'border-primary bg-primary text-white' : 'bg-white text-slate-500 hover:border-border-strong',
                          )}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    value={a.example}
                    onChange={(e) => setAnswers((s) => ({ ...s, [q.questionId]: { ...a, example: e.target.value } }))}
                    placeholder="Example that supports the rating (optional)"
                    className="h-9 text-sm"
                  />
                </li>
              )
            })}
          </ul>
        </Card>
      ))}

      <Card className="space-y-4 p-5">
        <Field label="Summary of this year’s objectives">
          <Textarea rows={3} value={currYearObj} onChange={(e) => setCurrYearObj(e.target.value)} />
        </Field>
        <Field label="Development needs">
          <Textarea rows={3} value={devNeeds} onChange={(e) => setDevNeeds(e.target.value)} />
        </Field>
        <Field label="Overall summary" required>
          <Textarea rows={4} value={overallSummary} onChange={(e) => setOverallSummary(e.target.value)} />
        </Field>
        <Field label="Overall rating" required>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {OVERALL_RATINGS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={supRating === r}
                onClick={() => setSupRating(r)}
                className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', supRating === r ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong')}
              >
                {OVERALL_LABELS[r]}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-start gap-3 rounded-xl border p-3 text-sm">
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
          <span>I confirm this appraisal is my fair assessment and sign it as the supervisor. The staff member will then add comments and sign.</span>
        </label>
        {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">{error}</p>}
      </Card>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-end gap-2 rounded-2xl border bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
        <span className="mr-auto text-xs text-muted-foreground">
          {rated} of {total} questions rated
        </span>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Send />} Sign and send to staff member
        </Button>
      </div>
    </form>
  )
}
