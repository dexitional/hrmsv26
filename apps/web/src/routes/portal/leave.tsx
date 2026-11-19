import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, CalendarPlus, Printer, Undo2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { portalLeaveSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { YearSwitch } from '#/components/leave/year-switch'
import { MY_LEAVE_LABELS } from '#/components/portal/labels'
import { useStaff } from '#/components/portal/session'

export const Route = createFileRoute('/portal/leave')({
  validateSearch: z.object({ apply: z.boolean().optional() }),
  component: MyLeave,
})

type R = Record<string, any>
const OPEN = ['STAFF-PENDING', 'HEAD-PENDING', 'HR-PENDING']

function MyLeave() {
  const { apply } = Route.useSearch()
  const navigate = useNavigate({ from: '/portal/leave' })
  const staff = useStaff()
  const { confirm, dialog } = useConfirm()
  const [year, setYear] = useState<number | null>(new Date().getFullYear())
  const { data } = useQuery({ queryKey: ['portal', 'leave', year], queryFn: () => api.get<R>('/portal/leave', { year: year ?? undefined }) })
  const withdraw = useSave((id: number) => api.post(`/portal/leave/${id}/cancel`), { invalidate: ['portal'], success: 'Application withdrawn' })
  const s = data?.summary
  const setApplying = (on: boolean) => navigate({ search: on ? { apply: true } : {}, replace: true })
  return (
    <>
      {dialog}
      <ApplyDialog open={Boolean(apply)} onClose={() => setApplying(false)} weekends={staff.staffGroup === 'SM'} />
      <PageHeader
        eyebrow="Staff services"
        title="Leave"
        description={staff.staffGroup === 'SM' ? 'Senior members’ leave days include weekends.' : 'Leave days are working days: weekends and public holidays are not counted.'}
        actions={
          <>
            <YearSwitch label="Year" value={year} onChange={setYear} />
            <Button onClick={() => setApplying(true)}>
              <CalendarPlus /> Apply for leave
            </Button>
          </>
        }
      />

      {s && (
        <Card className="mb-4">
          <CardHeader title={`Annual leave ${s.year}`} description="Entitlement, plus days deferred from last year and any balance, adjusted by the year’s leave constants." />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ['Entitlement', s.entitlement],
                ['Deferred in', s.deferred],
                ['Balance', s.balance],
                ['Constants', `${s.constants > 0 ? '+' : ''}${num(s.constants)}`],
                ['Taken', s.used],
                ['Remaining', s.remaining],
              ] as Array<[string, number | string]>
            ).map(([label, value], i) => (
              <div key={label} className={i === 5 ? 'rounded-xl bg-primary px-4 py-3 text-white' : 'rounded-xl bg-slate-50 px-4 py-3'}>
                <p className={i === 5 ? 'eyebrow text-white/70' : 'eyebrow'}>{label}</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">{typeof value === 'number' ? num(value) : value}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <DataTable
        rows={data?.applications}
        loading={!data}
        empty={<EmptyState icon={CalendarDays} title="No leave applications" description="Apply for leave and follow it here as your head and HR review it." />}
        columns={[
          { header: 'Applied', cell: (r: R) => <span className="text-xs whitespace-nowrap text-slate-600">{date(r.appliedDate)}</span> },
          { header: 'Type', cell: (r: R) => <span className="capitalize">{String(r.type ?? '').toLowerCase()}</span> },
          { header: 'Period', cell: (r: R) => <span className="whitespace-nowrap">{date(r.startDate)} – {date(r.endDate)}</span> },
          { header: 'Days', align: 'right', cell: (r: R) => <span className="font-mono">{r.approvedDays}</span> },
          { header: 'Resume', cell: (r: R) => <span className="whitespace-nowrap">{date(r.resumeDate)}</span> },
          {
            header: 'Status',
            cell: (r: R) => (
              <span className="block max-w-56">
                <StatusBadge status={r.status} label={MY_LEAVE_LABELS[r.status]} />
                {(r.status === 'HEAD-REJECTED' ? r.headRemark : r.status === 'HR-REJECTED' ? r.hrRemark : null) && (
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{r.status === 'HEAD-REJECTED' ? r.headRemark : r.hrRemark}</span>
                )}
              </span>
            ),
          },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <RowActions
                actions={[
                  { label: 'Print application', icon: Printer, onSelect: () => window.open(`/print/leave-application/${r.id}?from=portal`, '_blank') },
                  {
                    label: 'Withdraw',
                    icon: Undo2,
                    danger: true,
                    hidden: !OPEN.includes(r.status),
                    onSelect: () => confirm({ title: 'Withdraw this application?', description: `${r.approvedDays} days from ${date(r.startDate)}. You can apply again later.`, confirmLabel: 'Withdraw', danger: true, onConfirm: () => withdraw.mutateAsync(r.id) }),
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

type In = z.input<typeof portalLeaveSchema>

function ApplyDialog({ open, onClose, weekends }: { open: boolean; onClose: () => void; weekends: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const types = useQuery({ queryKey: ['portal', 'leave-types'], queryFn: () => api.get<Array<R>>('/portal/leave/types'), enabled: open })
  const colleagues = useQuery({ queryKey: ['portal', 'colleagues'], queryFn: () => api.get<Array<{ value: number; label: string; hint: string }>>('/portal/colleagues'), enabled: open })
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<In>({
    resolver: zodResolver(portalLeaveSchema),
    defaultValues: { typeId: 2 as never, startDate: '', endDate: '', relievedBy: null, emergencyContact: '', emergencyNote: '', applyNote: '' },
  })
  const [start, end] = [watch('startDate'), watch('endDate')]
  const days = useQuery({
    queryKey: ['portal', 'working-days', start, end],
    queryFn: () => api.get<{ days: number; resumeDate: string | null; holidays: Array<R> }>('/portal/leave/working-days', { start, end }),
    enabled: Boolean(open && start && end && end >= start),
  })
  const save = useSave((d: In) => api.post<{ id: number; days: number }>('/portal/leave', d), {
    invalidate: ['portal'],
    success: (r) => `Applied for ${r.days} days. Your head will review it next.`,
    onDone: () => (reset(), onClose()),
    onError: setError,
  })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setError(null))}
      title="Apply for leave"
      description="Your head of unit recommends it first, then the Directorate of Human Resource approves it."
      submitLabel="Submit application"
      busy={save.isPending}
      error={error}
      wide
      onSubmit={handleSubmit((d) => save.mutate(d))}
    >
      <Field label="Leave type" required error={err('typeId')} className="sm:col-span-2">
        <NativeSelect {...register('typeId')}>
          {(types.data ?? [{ id: 2, description: 'Annual Leave' }]).map((t) => (
            <option key={t.id} value={t.id}>
              {t.description?.trim() || t.title}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="First day of leave" required error={err('startDate')}>
        <Input type="date" min={new Date().toISOString().slice(0, 10)} {...register('startDate')} />
      </Field>
      <Field label="Last day of leave" required error={err('endDate')}>
        <Input type="date" min={start || undefined} {...register('endDate')} />
      </Field>
      <div className="rounded-xl bg-primary-soft/60 px-4 py-3 text-sm sm:col-span-2">
        {days.data ? (
          <p>
            <b className="text-primary">{num(days.data.days)} leave day{days.data.days === 1 ? '' : 's'}</b>
            {weekends ? ' (weekends included)' : ' (working days)'} · you resume on <b>{date(days.data.resumeDate, 'long')}</b>
            {days.data.holidays.length > 0 && <span className="block text-xs text-muted-foreground">Public holidays not counted: {days.data.holidays.map((h) => h.desc || date(h.date)).join(', ')}</span>}
          </p>
        ) : (
          <p className="text-muted-foreground">Choose the dates to see how many days this uses and when you resume.</p>
        )}
      </div>
      <Field label="Reliever" hint="A colleague who covers your duties while you are away" className="sm:col-span-2">
        <Controller
          control={control}
          name="relievedBy"
          render={({ field }) => (
            <Combobox options={colleagues.data} loading={colleagues.isLoading} value={(field.value as number | null) ?? null} onChange={field.onChange} placeholder="Choose a colleague (optional)…" />
          )}
        />
      </Field>
      <Field label="Phone while on leave" error={err('emergencyContact')}>
        <Input type="tel" {...register('emergencyContact')} />
      </Field>
      <Field label="Where you can be reached">
        <Input {...register('emergencyNote')} placeholder="Town or address" />
      </Field>
      <Field label="Note to your head" className="sm:col-span-2">
        <Textarea rows={2} {...register('applyNote')} />
      </Field>
      <Badge tone="info" dot={false} className="sm:col-span-2 w-fit">
        Leave cannot overlap another application, and annual leave must fit what remains for the year.
      </Badge>
    </FormDialog>
  )
}
