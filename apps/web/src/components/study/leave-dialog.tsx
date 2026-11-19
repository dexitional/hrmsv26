// The study leave grant form (legacy study_leave), in a dialog.
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { STUDY_LEAVE_STATUSES, STUDY_NATURES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { addYears, countries } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { studyLeaveSchema } from '#/lib/schemas'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { MultiCombobox } from '#/components/admin/combobox'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { StaffField } from '#/components/admin/staff-field'

type In = z.input<typeof studyLeaveSchema>
export type StudyLeaveDraft = Partial<In> & { id?: number }

const Section = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow border-b border-dashed pt-2 pb-1 sm:col-span-2">{children}</p>
)

export function StudyLeaveDialog({ value, onClose, onSaved }: { value: StudyLeaveDraft | null; onClose: () => void; onSaved?: (id: number) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [countryList, setCountryList] = useState<Array<string>>([])
  useEffect(() => setCountryList(countries()), [])
  const benefits = useQuery({ queryKey: ['study-benefits'], queryFn: () => api.get<Array<{ id: number; title: string }>>('/study/benefits') })
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<In>({ resolver: zodResolver(studyLeaveSchema) })
  const editing = Boolean(value?.id)
  useEffect(() => {
    if (!value) return
    setError(null)
    const v = (x: unknown) => (x === null || x === undefined ? '' : x)
    reset({
      staffNo: v(value.staffNo),
      studyType: v(value.studyType) || 'FULL',
      studyNature: v(value.studyNature) || 'REGULAR',
      studyNatureOther: v(value.studyNatureOther),
      studyProgram: v(value.studyProgram),
      studyInstitute: v(value.studyInstitute),
      studyCountry: v(value.studyCountry) || 'Ghana',
      studyStart: v(value.studyStart),
      studyEnd: v(value.studyEnd),
      studyPeriod: v(value.studyPeriod),
      studyBenefits: value.studyBenefits ?? [],
      studyBenefitOther: v(value.studyBenefitOther),
      studyGurantor1: v(value.studyGurantor1),
      studyGurantor2: v(value.studyGurantor2),
      studySupervisor1: v(value.studySupervisor1),
      studySupervisor2: v(value.studySupervisor2),
      studyReferName: v(value.studyReferName),
      studyReferRelation: v(value.studyReferRelation),
      studyReferAddress: v(value.studyReferAddress),
      studyReferPhone: v(value.studyReferPhone),
      studyReferEmail: v(value.studyReferEmail),
      studyBondStart: v(value.studyBondStart),
      studyBondEnd: v(value.studyBondEnd),
      studyBondPeriod: v(value.studyBondPeriod),
      studyCertTitle: v(value.studyCertTitle),
      studyCertValidity: v(value.studyCertValidity),
      docPath: v(value.docPath),
      status: v(value.status) || 'ON_LEAVE',
      remark: v(value.remark),
      intentionId: v(value.intentionId),
      requestId: v(value.requestId),
    } as In)
  }, [value, reset])
  const save = useSave(
    (v: In) => (editing ? api.put<{ id: number }>(`/study/leaves/${value!.id}`, v) : api.post<{ id: number }>('/study/leaves', v)),
    {
      invalidate: ['study-leaves', 'study-intentions', 'study-intention'],
      success: editing ? 'Study leave updated' : 'Study leave granted',
      onDone: (r) => (onClose(), onSaved?.(r.id)),
      onError: setError,
    },
  )
  const start = watch('studyStart') as string
  const period = Number(watch('studyPeriod'))
  const bondStart = watch('studyBondStart') as string
  const bondPeriod = Number(watch('studyBondPeriod'))
  const staffField = (name: 'studyGurantor1' | 'studyGurantor2' | 'studySupervisor1' | 'studySupervisor2', label: string) => (
    <Field label={label} error={errors[name]?.message as string | undefined}>
      <Controller control={control} name={name} render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
    </Field>
  )
  return (
    <FormDialog wide open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={editing ? 'Edit study leave' : 'Grant study leave'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error} submitLabel={editing ? 'Save' : 'Grant study leave'}>
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} disabled={editing || Boolean(value?.intentionId)} />} />
      </Field>
      <Section>Programme</Section>
      <Field label="Programme of study" required error={errors.studyProgram?.message} className="sm:col-span-2">
        <Input {...register('studyProgram')} />
      </Field>
      <Field label="Institution" required error={errors.studyInstitute?.message}>
        <Input {...register('studyInstitute')} />
      </Field>
      <Field label="Country of study">
        <NativeSelect {...register('studyCountry')}>
          <option value="">—</option>
          {countryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Type of study" required>
        <NativeSelect {...register('studyType')}>
          <option value="FULL">Full-time</option>
          <option value="PART">Part-time</option>
        </NativeSelect>
      </Field>
      <Field label="Mode of study" required>
        <NativeSelect {...register('studyNature')}>
          {STUDY_NATURES.map((n) => (
            <option key={n} value={n}>{statusLabel(n)}</option>
          ))}
        </NativeSelect>
      </Field>
      {watch('studyNature') === 'OTHER' && (
        <Field label="Other mode of study" className="sm:col-span-2">
          <Input {...register('studyNatureOther')} />
        </Field>
      )}
      <Field label="Duration (years)" error={errors.studyPeriod?.message}>
        <Input type="number" min={0} {...register('studyPeriod', { onChange: (e) => start && e.target.value && setValue('studyEnd', addYears(start, Number(e.target.value), true)) })} />
      </Field>
      <div />
      <Field label="Study start date" required error={errors.studyStart?.message}>
        <Input type="date" {...register('studyStart', { onChange: (e) => period && e.target.value && setValue('studyEnd', addYears(e.target.value, period, true)) })} />
      </Field>
      <Field label="Study end date" required error={errors.studyEnd?.message}>
        <Input type="date" {...register('studyEnd')} />
      </Field>
      <Field label="Benefits" className="sm:col-span-2">
        <Controller control={control} name="studyBenefits" render={({ field }) => <MultiCombobox options={benefits.data?.map((b) => ({ value: b.id, label: b.title }))} value={(field.value ?? []) as Array<number>} onChange={field.onChange} placeholder="Choose benefits…" />} />
      </Field>
      <Field label="Other benefits" className="sm:col-span-2">
        <Input {...register('studyBenefitOther')} />
      </Field>
      <Section>Guarantors & supervisors (staff numbers)</Section>
      {staffField('studyGurantor1', 'Guarantor 1')}
      {staffField('studyGurantor2', 'Guarantor 2')}
      {staffField('studySupervisor1', 'Supervisor 1')}
      {staffField('studySupervisor2', 'Supervisor 2')}
      <Section>Emergency contact while away</Section>
      <Field label="Full name">
        <Input {...register('studyReferName')} />
      </Field>
      <Field label="Relation">
        <Input {...register('studyReferRelation')} />
      </Field>
      <Field label="Phone">
        <Input type="tel" {...register('studyReferPhone')} />
      </Field>
      <Field label="Email" error={errors.studyReferEmail?.message}>
        <Input type="email" {...register('studyReferEmail')} />
      </Field>
      <Field label="Address" className="sm:col-span-2">
        <Input {...register('studyReferAddress')} />
      </Field>
      <Section>Completion & bond</Section>
      <Field label="Status">
        <NativeSelect {...register('status')}>
          {STUDY_LEAVE_STATUSES.map((st) => (
            <option key={st} value={st}>{statusLabel(st)}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Certificate obtained">
        <Input {...register('studyCertTitle')} />
      </Field>
      <Field label="Certificate validity">
        <NativeSelect {...register('studyCertValidity')}>
          <option value="">Not checked</option>
          <option value="AUTHENTIC">Authentic</option>
          <option value="FAKE">Not authentic</option>
        </NativeSelect>
      </Field>
      <Field label="Bond period (years)">
        <Input type="number" min={0} {...register('studyBondPeriod', { onChange: (e) => bondStart && e.target.value && setValue('studyBondEnd', addYears(bondStart, Number(e.target.value), true)) })} />
      </Field>
      <Field label="Resumption / bond start" error={errors.studyBondStart?.message}>
        <Input type="date" {...register('studyBondStart', { onChange: (e) => bondPeriod && e.target.value && setValue('studyBondEnd', addYears(e.target.value, bondPeriod, true)) })} />
      </Field>
      <Field label="Bond end" error={errors.studyBondEnd?.message}>
        <Input type="date" {...register('studyBondEnd')} />
      </Field>
      <Field label="Certificate (PDF)" className="sm:col-span-2">
        <Controller control={control} name="docPath" render={({ field }) => <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Certificate' : null }} onChange={(f) => field.onChange(f.url ?? '')} />} />
      </Field>
      <Field label="Remark" className="sm:col-span-2">
        <Textarea rows={2} {...register('remark')} />
      </Field>
    </FormDialog>
  )
}
