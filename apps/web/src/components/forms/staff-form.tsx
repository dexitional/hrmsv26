// The staff record form: personal information, emergency contact, personal
// documents, university information and current appointment.
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Hash, Loader2, Save, Sparkles } from 'lucide-react'
import { cn } from '@hrms/ui'
import { DOC_CATEGORIES, GHANA_REGIONS, LEGACY_STAFF_STATUSES, MARITAL_STATUSES, STAFF_GROUPS, STAFF_STATUSES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { countries } from '#/lib/format'
import { DOC_LABELS, GROUP_LABELS, MARITAL_LABELS, statusLabel } from '#/lib/labels'
import { staffSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { FileField } from '#/components/admin/file-upload'
import { Field, FormActions, FormSection } from '#/components/admin/form'
import { useJobs, useScales, useTitles, useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'

type In = z.input<typeof staffSchema>

const EMPTY_DOCS = { MARITAL: null, BIRTH: null, MEDICAL: null, CV: null }

/** Form values from a staff profile (GET /api/staff/:staffNo). */
export function staffToForm(r: Record<string, any>): In {
  const docs: Record<string, { url: string; name: string } | null> = { ...EMPTY_DOCS }
  for (const d of r.docs ?? []) if (!docs[d.category]) docs[d.category] = { url: d.path, name: d.title ?? DOC_LABELS[d.category] }
  const v = (x: unknown) => (x === null || x === undefined || String(x).startsWith('0000') ? '' : x)
  return {
    numbering: 'existing',
    staffNo: r.staffNo,
    title: v(r.title === '-- Select --' ? '' : r.title) as string,
    fname: v(r.fname) as string,
    mname: (v(r.mname) as string).trim?.() ?? '',
    lname: v(r.lname) as string,
    gender: (r.gender ?? '') as 'M',
    dob: v(r.dob) as string,
    hometown: v(r.hometown) as string,
    district: v(r.district) as string,
    region: v(r.region) as string,
    nationality: v(r.nationality ?? r.country) as string,
    phone: v(r.phone) as string,
    email: v(r.email) as string,
    paddress: v(r.paddress) as string,
    address: v(r.address) as string,
    emergencyName: v(r.emergencyName) as string,
    emergencyRelation: v(r.emergencyRelation) as string,
    emergencyPhone: v(r.emergencyPhone) as string,
    emergencyAddress: v(r.emergencyAddress ?? (r.emergencyName ? '' : r.emergencyContact)) as string,
    mstatus: (r.mstatus === 'NONE' ? '' : v(r.mstatus)) as 'SINGLE',
    ssnit: v(r.ssnit) as string,
    ghanaCardNo: v(r.ghanaCardNo) as string,
    uccMail: v(r.uccMail) as string,
    staffStatus: (r.staffStatus ?? 'PERMANENT') as 'PERMANENT',
    firstAppointDate: v(r.firstAppointDate ?? r.appointDate) as string,
    assumeDate: v(r.assumeDate ?? r.currentSince) as string,
    probation: v(r.probation) as number,
    jobId: (r.curJobId ?? '') as number,
    unitId: (r.curUnitId ?? '') as number,
    scaleId: (r.curScaleId ?? '') as number,
    staffGroup: (r.curStaffGroup ?? '') as 'SM',
    docs: docs as In['docs'],
  }
}

const BLANK: In = {
  numbering: 'new',
  staffNo: '' as unknown as number,
  title: '',
  fname: '',
  mname: '',
  lname: '',
  gender: '' as 'M',
  dob: '',
  hometown: '',
  district: '',
  region: '',
  nationality: 'Ghana',
  phone: '',
  email: '',
  paddress: '',
  address: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
  emergencyAddress: '',
  mstatus: '' as 'SINGLE',
  ssnit: '',
  ghanaCardNo: '',
  uccMail: '',
  staffStatus: 'PERMANENT',
  firstAppointDate: '',
  assumeDate: '',
  probation: '' as unknown as number,
  jobId: '' as unknown as number,
  unitId: '' as unknown as number,
  scaleId: '' as unknown as number,
  staffGroup: '' as 'SM',
  docs: EMPTY_DOCS,
}

export function StaffForm({ staff }: { staff?: Record<string, any> }) {
  const navigate = useNavigate()
  const units = useUnits()
  const jobs = useJobs()
  const scales = useScales()
  const titles = useTitles()
  const next = useQuery({ queryKey: ['staff-next-number'], queryFn: () => api.get<{ staffNo: number }>('/staff/next-number'), enabled: !staff })
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<In>({ resolver: zodResolver(staffSchema), defaultValues: staff ? staffToForm(staff) : BLANK })
  useEffect(() => {
    if (staff) reset(staffToForm(staff))
  }, [staff, reset])
  const save = useSave(
    (v: In) =>
      staff ? api.put<{ staffNo: number }>(`/staff/${staff.staffNo}`, v) : api.post<{ staffNo: number }>('/staff', v),
    {
      invalidate: ['staff', 'staff-next-number', 'staff-brief'],
      success: (r) => (staff ? 'Staff record saved' : `Staff ${r.staffNo} created`),
      onDone: (r) => navigate({ to: '/admin/staff/$staffNo', params: { staffNo: String(r.staffNo) } }),
    },
  )
  const numbering = watch('numbering')
  // Built after mount: the server's and browser's ICU data name some countries differently.
  const [nationalities, setNationalities] = useState<Array<string>>([])
  useEffect(() => setNationalities(countries()), [])
  const nationality = (watch('nationality') as string | null) ?? ''
  const region = (watch('region') as string | null) ?? ''
  const status = watch('staffStatus')
  const statuses = [...STAFF_STATUSES, ...LEGACY_STAFF_STATUSES]
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="rounded-2xl border bg-white p-6 max-md:p-4">
      {!staff && (
        <FormSection title="Staff number" description="New staff get the next number automatically. Staff already employed keep the number on their file.">
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            {(
              [
                { value: 'new', icon: Sparkles, title: 'New staff', text: next.data ? `Will be numbered ${next.data.staffNo}` : 'Number generated on save' },
                { value: 'existing', icon: Hash, title: 'Existing staff', text: 'Enter their current staff number' },
              ] as const
            ).map((o) => (
              <label
                key={o.value}
                className={cn('flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-colors', numbering === o.value ? 'border-primary bg-primary-soft' : 'border-border hover:border-border-strong')}
              >
                <input type="radio" value={o.value} {...register('numbering')} className="sr-only" />
                <o.icon className={cn('mt-0.5 size-5', numbering === o.value ? 'text-primary' : 'text-slate-400')} />
                <span>
                  <span className="block text-sm font-bold text-slate-900">{o.title}</span>
                  <span className="text-xs text-muted-foreground">{o.text}</span>
                </span>
              </label>
            ))}
          </div>
          {numbering === 'existing' && (
            <Field label="Staff number" required error={err('staffNo')}>
              <Input inputMode="numeric" className="font-mono" {...register('staffNo')} />
            </Field>
          )}
        </FormSection>
      )}

      <FormSection index={1} title="Personal information" description="As shown on the staff member's identity documents.">
        <Field label="Title">
          <NativeSelect {...register('title')}>
            <option value="">—</option>
            {titles.data?.map((t) => (
              <option key={t.value} value={t.label}>{t.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Gender" required error={err('gender')}>
          <NativeSelect {...register('gender')} aria-invalid={Boolean(errors.gender)}>
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
        <Field label="Date of birth" required error={err('dob')} hint={staff ? 'Changes here are recorded; use Date of Birth to log a reason.' : undefined}>
          <Input type="date" {...register('dob')} readOnly={Boolean(staff)} className={staff ? 'bg-slate-100' : undefined} />
        </Field>
        <Field label="Hometown">
          <Input {...register('hometown')} />
        </Field>
        <Field label="District">
          <Input {...register('district')} />
        </Field>
        <Field label="Region">
          <NativeSelect {...register('region')}>
            <option value="">—</option>
            {region && !GHANA_REGIONS.includes(region as never) && <option value={region}>{region}</option>}
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Nationality">
          <NativeSelect {...register('nationality')}>
            <option value="">—</option>
            {nationality && !nationalities.includes(nationality) && <option value={nationality}>{nationality}</option>}
            {nationalities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Phone" error={err('phone')}>
          <Input type="tel" {...register('phone')} placeholder="024 000 0000" />
        </Field>
        <Field label="E-mail address" error={err('email')} hint="Personal email">
          <Input type="email" {...register('email')} />
        </Field>
        <Field label="Marital status">
          <NativeSelect {...register('mstatus')}>
            <option value="">—</option>
            {MARITAL_STATUSES.map((m) => (
              <option key={m} value={m}>{MARITAL_LABELS[m]}</option>
            ))}
          </NativeSelect>
        </Field>
        <div />
        <Field label="Permanent address" className="sm:col-span-2">
          <Textarea rows={2} {...register('paddress')} />
        </Field>
        <Field label="Current residential address" hint="State the house number, area and a landmark" className="sm:col-span-2">
          <Textarea rows={2} {...register('address')} placeholder="e.g. H/No. A12, Amamoma — near the Presby Church" />
        </Field>
      </FormSection>

      <FormSection index={2} title="Emergency contact" description="Who to contact in an emergency.">
        <Field label="Full name">
          <Input {...register('emergencyName')} />
        </Field>
        <Field label="Relation">
          <Input {...register('emergencyRelation')} placeholder="e.g. Spouse, Brother" />
        </Field>
        <Field label="Phone number">
          <Input type="tel" {...register('emergencyPhone')} />
        </Field>
        <Field label="Contact address">
          <Input {...register('emergencyAddress')} />
        </Field>
      </FormSection>

      <FormSection index={3} title="Personal documents" description="PDF copies, up to 10 MB each.">
        {DOC_CATEGORIES.map((cat) => (
          <Field key={cat} label={DOC_LABELS[cat]!} className={cat === 'CV' ? 'sm:col-span-2' : undefined}>
            <Controller
              control={control}
              name={`docs.${cat}` as const}
              render={({ field }) => (
                <FileField
                  accept=".pdf,application/pdf"
                  endpoint="/files/pdf"
                  value={{ url: field.value?.url ?? null, name: field.value?.name ?? null }}
                  onChange={(f) => field.onChange(f.url ? { url: f.url, name: f.name ?? DOC_LABELS[cat] } : null)}
                />
              )}
            />
          </Field>
        ))}
      </FormSection>

      <FormSection index={4} title="University information" description="Identification numbers and employment status.">
        <Field label="SSNIT number">
          <Input {...register('ssnit')} className="font-mono uppercase" />
        </Field>
        <Field label="Ghana Card number">
          <Input {...register('ghanaCardNo')} className="font-mono uppercase" placeholder="GHA-000000000-0" />
        </Field>
        <Field label="University email" error={err('uccMail')}>
          <Input type="email" {...register('uccMail')} placeholder="name@ucc.edu.gh" />
        </Field>
        <Field label="Staff current status" required error={err('staffStatus')}>
          <NativeSelect {...register('staffStatus')}>
            {statuses
              .filter((st) => STAFF_STATUSES.includes(st as never) || st === status)
              .map((st) => (
                <option key={st} value={st}>{statusLabel(st)}</option>
              ))}
          </NativeSelect>
        </Field>
      </FormSection>

      <FormSection index={5} title="Appointment information" description={staff ? 'Corrects the current appointment record. Record promotions and upgrades under Elevation.' : 'Creates the staff member’s first appointment record.'}>
        <Field label="Appointment date" error={err('firstAppointDate')} hint="Date of the first appointment letter">
          <Input type="date" {...register('firstAppointDate')} />
        </Field>
        <Field label="Assumption date" error={err('assumeDate')}>
          <Input type="date" {...register('assumeDate')} />
        </Field>
        <Field label="Probation period (years)" error={err('probation')}>
          <Input type="number" min={0} max={10} {...register('probation')} />
        </Field>
        <Field label="Staff category" required error={err('staffGroup')}>
          <NativeSelect {...register('staffGroup')} aria-invalid={Boolean(errors.staffGroup)}>
            <option value="">Choose…</option>
            {STAFF_GROUPS.map((g) => (
              <option key={g} value={g}>{g} – {GROUP_LABELS[g]}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Job title / designation" required error={err('jobId')} className="sm:col-span-2">
          <Controller
            control={control}
            name="jobId"
            render={({ field }) => (
              <Combobox
                options={jobs.data}
                loading={jobs.isLoading}
                value={field.value as number}
                invalid={Boolean(errors.jobId)}
                onChange={(v, o) => {
                  field.onChange(v)
                  if (o?.staffGroup && !watch('staffGroup')) setValue('staffGroup', o.staffGroup as 'SM')
                }}
                placeholder="Choose designation…"
              />
            )}
          />
        </Field>
        <Field label="Section / unit" required error={err('unitId')}>
          <Controller control={control} name="unitId" render={({ field }) => <Combobox options={units.data} loading={units.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.unitId)} placeholder="Choose unit…" />} />
        </Field>
        <Field label="Grade / scale">
          <Controller control={control} name="scaleId" render={({ field }) => <Combobox options={scales.data} loading={scales.isLoading} value={field.value as number} onChange={field.onChange} placeholder="Choose grade and notch…" />} />
        </Field>
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} {staff ? 'Save changes' : 'Create staff record'}
        </Button>
      </FormActions>
    </form>
  )
}
