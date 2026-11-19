import { useNavigate } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import { api } from '#/lib/api-client'
import { addYears } from '#/lib/format'
import { nssSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { FileField, PhotoField } from '#/components/admin/file-upload'
import { Field, FormActions, FormSection } from '#/components/admin/form'
import { useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { Avatar } from '#/components/admin/page'

type In = z.input<typeof nssSchema>

const v = (x: unknown) => (x === null || x === undefined || String(x).startsWith('0000') ? '' : (x as string))

export function NssForm({ person }: { person?: Record<string, any> }) {
  const navigate = useNavigate()
  const units = useUnits()
  const year = new Date().getFullYear()
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<In>({
    resolver: zodResolver(nssSchema),
    defaultValues: {
      nssNo: v(person?.nssNo),
      fname: v(person?.fname).trim(),
      mname: v(person?.mname).trim(),
      lname: v(person?.lname).trim(),
      mobile: v(person?.mobile),
      email: v(person?.email),
      gender: (person?.gender ?? '') as 'M',
      dob: v(person?.dob),
      hometown: v(person?.hometown),
      unitId: (person?.unitId ?? '') as number,
      ghcardNo: v(person?.ghcardNo),
      photo: v(person?.photo),
      nssForm: v(person?.nssForm),
      address: v(person?.address),
      emergencyAddress: v(person?.emergencyAddress ?? (person?.emergencyPhone ? '' : person?.emergencyContact)),
      emergencyPhone: v(person?.emergencyPhone),
      emergencyEmail: v(person?.emergencyEmail),
      startDate: v(person?.startDate) || `${year}-11-01`,
      endDate: v(person?.endDate) || `${year + 1}-10-31`,
    },
  })
  const save = useSave((data: In) => (person ? api.put<{ id: number }>(`/nss/${person.id}`, data) : api.post<{ id: number }>('/nss', data)), {
    invalidate: ['nss'],
    success: person ? 'Personnel record saved' : 'National service personnel added',
    onDone: (r) => navigate({ to: '/admin/nss/$id', params: { id: String(r.id) } }),
  })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  const name = `${watch('fname') ?? ''} ${watch('lname') ?? ''}`
  return (
    <form onSubmit={handleSubmit((d) => save.mutate(d))} noValidate className="rounded-2xl border bg-white p-6 max-md:p-4">
      <FormSection index={1} title="Personnel" description="As on the national service posting letter.">
        <Field label="NSS number / PIN" required error={err('nssNo')}>
          <Input {...register('nssNo')} className="font-mono uppercase" placeholder="NSSGCC0000000" />
        </Field>
        <Field label="Gender" required error={err('gender')}>
          <NativeSelect {...register('gender')}>
            <option value="">Choose…</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </NativeSelect>
        </Field>
        <Field label="First name" required error={err('fname')}>
          <Input {...register('fname')} className="uppercase" />
        </Field>
        <Field label="Middle name(s)">
          <Input {...register('mname')} className="uppercase" />
        </Field>
        <Field label="Last name" required error={err('lname')}>
          <Input {...register('lname')} className="uppercase" />
        </Field>
        <Field label="Date of birth" error={err('dob')}>
          <Input type="date" {...register('dob')} />
        </Field>
        <Field label="Phone number" error={err('mobile')}>
          <Input type="tel" {...register('mobile')} />
        </Field>
        <Field label="Email address" error={err('email')}>
          <Input type="email" {...register('email')} />
        </Field>
        <Field label="Hometown">
          <Input {...register('hometown')} />
        </Field>
        <Field label="Ghana Card number">
          <Input {...register('ghcardNo')} className="font-mono uppercase" placeholder="GHA-000000000-0" />
        </Field>
        <Field label="Permanent address" className="sm:col-span-2">
          <Textarea rows={2} {...register('address')} />
        </Field>
      </FormSection>

      <FormSection index={2} title="Service" description="Where and when the personnel serves.">
        <Field label="Assigned unit" required error={err('unitId')} className="sm:col-span-2">
          <Controller control={control} name="unitId" render={({ field }) => <Combobox options={units.data} loading={units.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.unitId)} placeholder="Choose unit…" />} />
        </Field>
        <Field label="Service start date" required error={err('startDate')}>
          <Input type="date" {...register('startDate', { onChange: (e) => e.target.value && setValue('endDate', addYears(e.target.value, 1, true)) })} />
        </Field>
        <Field label="Service end date" required error={err('endDate')}>
          <Input type="date" {...register('endDate')} />
        </Field>
      </FormSection>

      <FormSection index={3} title="Emergency contact">
        <Field label="Phone">
          <Input type="tel" {...register('emergencyPhone')} />
        </Field>
        <Field label="Email" error={err('emergencyEmail')}>
          <Input type="email" {...register('emergencyEmail')} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Input {...register('emergencyAddress')} />
        </Field>
      </FormSection>

      <FormSection index={4} title="Photo & documents">
        <Field label="Photo" className="sm:col-span-2">
          <Controller
            control={control}
            name="photo"
            render={({ field }) => (
              <PhotoField value={(field.value as string) || null} onChange={(u) => field.onChange(u ?? '')} preview={<Avatar name={name} photoUrl={(field.value as string) || null} className="size-20 text-lg" />} />
            )}
          />
        </Field>
        <Field label="NSS form (PDF)" className="sm:col-span-2">
          <Controller
            control={control}
            name="nssForm"
            render={({ field }) => (
              <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'NSS form' : null }} onChange={(f) => field.onChange(f.url ?? '')} />
            )}
          />
        </Field>
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} {person ? 'Save changes' : 'Add personnel'}
        </Button>
      </FormActions>
    </form>
  )
}
