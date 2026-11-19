// HR applies for leave on a staff member's behalf, or corrects an application
// still pending with the head of unit or HR. Working days, the resumption
// date and the staff member's remaining annual leave are shown as the dates
// are picked.
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { CalendarCheck2, Info } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { leaveApplicationSchema } from '#/lib/schemas'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useLeaveTypes } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { StaffField } from '#/components/admin/staff-field'

type In = z.input<typeof leaveApplicationSchema>
type Row = Record<string, any>

const ANNUAL = 2

export function LeaveApplicationDialog({ value, onClose }: { value: { row: Row | null } | null; onClose: () => void }) {
  const row = value?.row ?? null
  const [error, setError] = useState<string | null>(null)
  const types = useLeaveTypes()
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<In>({ resolver: zodResolver(leaveApplicationSchema) })
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      staffNo: row?.staffNo ?? '',
      typeId: row?.typeId ?? ANNUAL,
      startDate: row?.startDate ?? '',
      endDate: row?.endDate ?? '',
      relievedBy: row?.relievedBy || '',
      emergencyNote: row?.emergencyNote ?? '',
      emergencyContact: row?.emergencyContact ?? '',
      applyNote: row?.applyNote ?? '',
      doc: row?.doc ?? '',
      status: row?.status === 'HEAD-PENDING' ? 'HEAD-PENDING' : 'HR-PENDING',
    } as In)
  }, [value, row, reset])

  const staffNo = Number(watch('staffNo')) || null
  const start = watch('startDate') as string
  const end = watch('endDate') as string
  const typeId = Number(watch('typeId'))
  const datesReady = /^\d{4}-\d{2}-\d{2}$/.test(start ?? '') && /^\d{4}-\d{2}-\d{2}$/.test(end ?? '') && end >= start
  const counted = useQuery({
    queryKey: ['working-days', start, end, staffNo],
    queryFn: () =>
      api.get<{ days: number; resumeDate: string; includeWeekends: boolean; holidays: Array<{ date: string; desc: string }> }>(
        '/leave/working-days',
        { start, end, staffNo },
      ),
    enabled: datesReady,
  })
  const year = Number((start || new Date().toISOString()).slice(0, 4))
  const stats = useQuery({
    queryKey: ['leave-stats', String(staffNo)],
    queryFn: () => api.get<{ summary: Array<Row> }>(`/leave/statistics/${staffNo}`),
    enabled: Boolean(staffNo) && staffNo! > 0,
    retry: false,
  })
  const yearSummary = stats.data?.summary.find((s) => s.year === year)
  // When editing, this application's own days are not yet "used".
  const counted_ = row && ['GRANTED', 'ENDED', 'STAFF-PENDING', 'HEAD-PENDING', 'HR-PENDING'].includes(row.status) && String(row.startDate ?? '').startsWith(String(year))
  const remaining = yearSummary ? yearSummary.remaining + (counted_ ? Number(row.approvedDays) : 0) : null
  const over = typeId === ANNUAL && remaining !== null && counted.data ? counted.data.days > remaining : false

  const save = useSave((v: In) => (row ? api.put(`/leave/records/${row.id}`, v) : api.post('/leave/records', v)), {
    invalidate: ['leave-records', 'leave-stats', 'staff'],
    success: row ? 'Leave application updated' : 'Leave application recorded',
    onDone: onClose,
    onError: setError,
  })

  return (
    <FormDialog
      wide
      open={Boolean(value)}
      onOpenChange={(o) => !o && onClose()}
      title={row ? `Edit leave application #${row.id}` : 'Apply for leave on behalf of staff'}
      description={row ? 'Only applications still pending with the head of unit or HR can be changed.' : 'For applications received on paper or by email.'}
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
      submitLabel={row ? 'Save changes' : 'Submit application'}
    >
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} disabled={Boolean(row)} />} />
      </Field>
      <Field label="Leave type" required error={errors.typeId?.message}>
        <NativeSelect {...register('typeId')}>
          {types.data?.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
              {t.active ? '' : ' (closed)'}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Send to" hint="HR applications usually go straight to HR">
        <NativeSelect {...register('status')}>
          <option value="HR-PENDING">HR (HR pended)</option>
          <option value="HEAD-PENDING">Head of unit first (head pended)</option>
        </NativeSelect>
      </Field>
      <Field label="Start date" required error={errors.startDate?.message}>
        <Input type="date" {...register('startDate')} />
      </Field>
      <Field label="End date" required error={errors.endDate?.message}>
        <Input type="date" {...register('endDate')} />
      </Field>

      <div
        className={cn(
          'flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border px-4 py-3 text-sm sm:col-span-2',
          over ? 'border-red-200 bg-secondary-soft' : 'border-primary/15 bg-primary-soft/60',
        )}
      >
        <CalendarCheck2 className={cn('size-5', over ? 'text-secondary-foreground' : 'text-primary')} />
        {datesReady && counted.data ? (
          <>
            <span>
              <b className="font-mono text-base">{counted.data.days}</b> {counted.data.includeWeekends ? 'calendar' : 'business'} day
              {counted.data.days === 1 ? '' : 's'}
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({counted.data.includeWeekends ? 'Senior Member: weekends counted' : 'weekends not counted'})
              </span>
            </span>
            <span>
              Resumes <b>{date(counted.data.resumeDate, 'long')}</b>
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">Pick the dates to count the leave days.</span>
        )}
        {typeId === ANNUAL && remaining !== null && (
          <span className={cn('ml-auto', over && 'font-semibold text-secondary-foreground')}>
            {num(remaining)} of {num(yearSummary?.total)} annual days left in {year}
          </span>
        )}
        {counted.data && counted.data.holidays.length > 0 && (
          <p className="flex w-full items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5" /> Public holidays not counted: {counted.data.holidays.map((h) => `${h.desc} (${date(h.date)})`).join(', ')}
          </p>
        )}
      </div>

      <Field label="Reliever (staff number)" error={errors.relievedBy?.message} className="sm:col-span-2">
        <Controller control={control} name="relievedBy" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} placeholder="Who covers while away" />} />
      </Field>
      <Field label="Address / contact person while on leave">
        <Input {...register('emergencyNote')} />
      </Field>
      <Field label="Phone while on leave" error={errors.emergencyContact?.message}>
        <Input type="tel" {...register('emergencyContact')} />
      </Field>
      <Field label="Application note" className="sm:col-span-2">
        <Textarea rows={3} {...register('applyNote')} placeholder="The staff member's application letter or note" />
      </Field>
      <Field label="Supporting document (PDF)" hint="e.g. medical certificate, exam timetable" className="sm:col-span-2">
        <Controller
          control={control}
          name="doc"
          render={({ field }) => (
            <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Supporting document' : null }} onChange={(f) => field.onChange(f.url ?? '')} />
          )}
        />
      </Field>
    </FormDialog>
  )
}
