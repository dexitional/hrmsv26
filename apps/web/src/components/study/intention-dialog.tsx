// The declaration of intention to pursue further studies (legacy
// study_intention), edited by HR on the staff member's behalf, or by the
// staff member in the staff portal while it is still with their head of unit.
// The questions and their numbering follow the staff portal's form.
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { api } from '#/lib/api-client'
import { STUDY_MODES, STUDY_SPONSORSHIPS, studyIntentionSchema } from '#/lib/schemas'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'

type In = z.input<typeof studyIntentionSchema>
type R = Record<string, any>

const Section = ({ children }: { children: React.ReactNode }) => <p className="eyebrow border-b border-dashed pt-2 pb-1 sm:col-span-2">{children}</p>

const v = (x: unknown) => (x === null || x === undefined || x === '0000-00-00' ? '' : String(x))
const date = (x: unknown) => v(x).slice(0, 10)

/** `intention` is a row from /study/intentions (or the detail endpoint); null closes the dialog. */
export function IntentionDialog({ intention, onClose, asStaff = false }: { intention: R | null; onClose: () => void; asStaff?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<In>({ resolver: zodResolver(studyIntentionSchema) })
  useEffect(() => {
    if (!intention) return
    setError(null)
    reset({
      college: v(intention.college),
      department: v(intention.department),
      presentRank: v(intention.presentRank),
      highEdu: v(intention.highEdu),
      studyLeave: v(intention.studyLeave),
      intProg: v(intention.intProg),
      studyPlace: v(intention.studyPlace),
      dateCommence: date(intention.dateCommence),
      progDuration: v(intention.progDuration),
      progType: v(intention.progType) as never,
      studyMode: v(intention.studyMode) as never,
      otherStudyMode: v(intention.otherStudyMode),
      sponsorKind: v(intention.sponsorKind) as never,
      otherScholarship: v(intention.otherScholarship),
      estimatedFees: v(intention.estimatedFees),
      progRelevance: v(intention.progRelevance),
      subDate: date(intention.subDate),
    })
  }, [intention, reset])
  const save = useSave((d: In) => api.put<{ changed: number }>(`${asStaff ? '/portal/study/intentions' : '/study/intentions'}/${intention!.id}`, d), {
    invalidate: asStaff ? ['portal'] : ['study-intention', 'study-intentions'],
    success: (r) => (r.changed ? 'Application updated' : 'No changes to save'),
    onDone: onClose,
    onError: setError,
  })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  const sponsor = watch('sponsorKind')
  return (
    <FormDialog
      open={Boolean(intention)}
      onOpenChange={(o) => !o && onClose()}
      title={asStaff ? 'Edit your intention to study' : 'Edit intention to study'}
      description={
        !intention
          ? undefined
          : asStaff
            ? 'You can correct it while it is still with your head of unit. Once they act on it, it can no longer be changed.'
            : `On behalf of ${intention.fullName ?? `staff ${intention.staffNo}`} (${intention.staffNo}). The approval stage stays as it is; the change is logged against you.`
      }
      submitLabel="Save changes"
      busy={save.isPending}
      error={error}
      wide
      onSubmit={handleSubmit((d) => save.mutate(d))}
    >
      <Section>Applicant details (as stated on the form)</Section>
      <Field label="College" error={err('college')}>
        <Input {...register('college')} />
      </Field>
      <Field label="Department / unit" error={err('department')}>
        <Input {...register('department')} />
      </Field>
      <Field label="Present rank / position" error={err('presentRank')} className="sm:col-span-2">
        <Input {...register('presentRank')} />
      </Field>

      <Section>The application</Section>
      <Field label="1. Highest educational qualification / programme" error={err('highEdu')} className="sm:col-span-2">
        <Input {...register('highEdu')} />
      </Field>
      <Field label="2. Last time study leave was granted, if any" hint="Programme, start and end date (40 characters)" error={err('studyLeave')} className="sm:col-span-2">
        <Input maxLength={40} {...register('studyLeave')} />
      </Field>
      <Field label="3. Intended programme of study" required error={err('intProg')} className="sm:col-span-2">
        <Input {...register('intProg')} />
      </Field>
      <Field label="4. Intended place of study" required error={err('studyPlace')} className="sm:col-span-2">
        <Input {...register('studyPlace')} />
      </Field>
      <Field label="5. Date of commencement" error={err('dateCommence')}>
        <Input type="date" {...register('dateCommence')} />
      </Field>
      <Field label="6. Duration of programme (years)" error={err('progDuration')}>
        <Input maxLength={15} {...register('progDuration')} />
      </Field>
      <Field label="7. Type of programme" required error={err('progType')}>
        <NativeSelect {...register('progType')}>
          <option value="">Choose…</option>
          <option value="1">Full-time</option>
          <option value="2">Part-time</option>
        </NativeSelect>
      </Field>
      <Field label="8. Mode of study" required error={err('studyMode')}>
        <NativeSelect {...register('studyMode')}>
          <option value="">Choose…</option>
          {STUDY_MODES.map((m) => (
            <option key={m} value={m}>
              {m === 'OTHERS' ? 'Others (specify)' : m.charAt(0) + m.slice(1).toLowerCase()}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {watch('studyMode') === 'OTHERS' && (
        <Field label="8.1 Other mode of study" required error={err('otherStudyMode')} className="sm:col-span-2">
          <Input {...register('otherStudyMode')} />
        </Field>
      )}
      <Field label="9. Kind of sponsorship required" error={err('sponsorKind')} className="sm:col-span-2">
        <NativeSelect {...register('sponsorKind')}>
          <option value="">Not stated</option>
          {STUDY_SPONSORSHIPS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="10. Other scholarship packages obtained" hint={sponsor === STUDY_SPONSORSHIPS[2] ? 'Value and other details (80 characters)' : '80 characters'} error={err('otherScholarship')}>
        <Input maxLength={80} {...register('otherScholarship')} />
      </Field>
      <Field label="10.1 Estimated fees for year 1 (GHS)" error={err('estimatedFees')}>
        <Input inputMode="decimal" {...register('estimatedFees')} />
      </Field>
      <Field label="11. Relevance of programme to department / university" error={err('progRelevance')} className="sm:col-span-2">
        <Textarea rows={4} {...register('progRelevance')} />
      </Field>
      <Field label="Date signed" error={err('subDate')}>
        <Input type="date" {...register('subDate')} />
      </Field>
    </FormDialog>
  )
}
