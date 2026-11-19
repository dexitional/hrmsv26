// Form B: the staff member's self-appraisal (new or, before countersigning, edited).
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Loader2, Send } from 'lucide-react'
import { api } from '#/lib/api-client'
import { selfAppraisalSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Field, FormActions, FormSection } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'

type In = z.input<typeof selfAppraisalSchema>
type R = Record<string, any>
const v = (x: unknown) => (x == null ? '' : String(x))

export function SelfAppraisalForm({ existing, year, supervisor }: { existing?: R; year: string; supervisor?: { name: string; rank: string | null } | null }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<In>({
    resolver: zodResolver(selfAppraisalSchema),
    defaultValues: {
      year: existing?.year ?? year,
      supervisorName: v(existing?.supervisorName ?? supervisor?.name),
      supervisorsRank: v(existing?.supervisorsRank ?? supervisor?.rank),
      accomplishments: v(existing?.accomplishments),
      barriersChallenges: v(existing?.barriersChallenges),
      barriersChallengesGoal: v(existing?.barriersChallengesGoal),
      strengthImprovement: v(existing?.strengthImprovement),
      newKnowledge: v(existing?.newKnowledge),
      otherInformation: v(existing?.otherInformation),
      confirm: undefined as never,
    },
  })
  const save = useSave((d: In) => (existing ? api.put(`/portal/appraisal/b/${existing.id}`, d) : api.post('/portal/appraisal/b', d)), {
    invalidate: ['portal'],
    success: existing ? 'Self-appraisal updated' : 'Self-appraisal submitted to your supervisor',
    onDone: () => navigate({ to: '/portal/appraisal' }),
  })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  return (
    <form onSubmit={handleSubmit((d) => save.mutate(d))} noValidate className="rounded-2xl border bg-white p-6 max-md:p-4">
      <FormSection index={1} title="Review" description="The year under review and the supervisor who will countersign.">
        <Field label="Year under review" required error={err('year')}>
          <Input {...register('year')} readOnly={Boolean(existing)} inputMode="numeric" className="font-mono" />
        </Field>
        <span />
        <Field label="Supervisor" required error={err('supervisorName')}>
          <Input {...register('supervisorName')} />
        </Field>
        <Field label="Supervisor’s rank">
          <Input {...register('supervisorsRank')} />
        </Field>
      </FormSection>
      <FormSection index={2} title="Your year" description="Be specific: what you delivered, what got in the way, and what you learnt.">
        <Field label="Main accomplishments" required error={err('accomplishments')} className="sm:col-span-2">
          <Textarea rows={5} {...register('accomplishments')} />
        </Field>
        <Field label="Barriers and challenges you faced" className="sm:col-span-2">
          <Textarea rows={3} {...register('barriersChallenges')} />
        </Field>
        <Field label="How those barriers affected your goals" className="sm:col-span-2">
          <Textarea rows={3} {...register('barriersChallengesGoal')} />
        </Field>
        <Field label="Your strengths, and areas to improve" className="sm:col-span-2">
          <Textarea rows={3} {...register('strengthImprovement')} />
        </Field>
        <Field label="New knowledge and skills gained" className="sm:col-span-2">
          <Textarea rows={3} {...register('newKnowledge')} />
        </Field>
        <Field label="Anything else your supervisor should know" className="sm:col-span-2">
          <Textarea rows={3} {...register('otherInformation')} />
        </Field>
      </FormSection>
      <FormSection index={3} title="Sign">
        <label className="flex items-start gap-3 rounded-xl border p-3 text-sm sm:col-span-2">
          <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" {...register('confirm')} />
          <span>
            I confirm this self-appraisal is a true account of my year and sign it.
            {err('confirm') && <span className="mt-1 block text-xs font-medium text-destructive">{err('confirm')}</span>}
          </span>
        </label>
      </FormSection>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Send />} {existing ? 'Save changes' : 'Sign and submit'}
        </Button>
      </FormActions>
    </form>
  )
}
