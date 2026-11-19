import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { GROUP_LABELS, LEAVE_STATUS_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/leave/$staffNo')({
  head: () => ({ meta: [{ title: 'Leave statistics · UCC HRMS' }] }),
  component: PrintLeave,
})

type R = Record<string, any>

function PrintLeave() {
  const { staffNo } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['leave-stats', staffNo],
    queryFn: () => api.get<{ staff: R; summary: Array<R>; records: Array<R>; balances: Array<R>; deferments: Array<R> }>(`/leave/statistics/${staffNo}`),
  })
  const s = data?.staff
  return (
    <PrintPage landscape title="Staff Leave Statistics" subtitle={s?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {s && data && (
        <>
          <PrintParticulars
            items={[
              ['Name', s.fullName],
              ['Staff number', s.staffNo],
              ['Designation', s.jobTitle],
              ['Unit', s.unitName],
              ['Category', s.staffGroup ? GROUP_LABELS[s.staffGroup] : null],
              ['Applications on record', data.records.length],
            ]}
          />
          <PrintSection>Annual leave by year</PrintSection>
          <PrintTable
            head={['Year', 'Entitlement', 'Constants (+/−)', 'Legacy balance', 'Deferred in', 'Total', 'Days taken', 'Remaining']}
            rows={data.summary.map((y) => [
              y.year,
              num(y.entitlement),
              `${y.constants > 0 ? '+' : ''}${num(y.constants)}`,
              num(y.balance),
              num(y.deferred),
              <b>{num(y.total)}</b>,
              num(y.used),
              <b>{num(y.remaining)}</b>,
            ])}
          />
          {data.summary.some((y) => y.adjustments.length) && (
            <p className="mt-1 text-[8.5pt] italic">
              Constants:{' '}
              {data.summary
                .flatMap((y) => y.adjustments.map((a: R) => `${y.year} ${a.desc} (${a.type === 'ADD' ? '+' : '−'}${a.weight})`))
                .join('; ')}
            </p>
          )}
          <PrintSection>Leave records</PrintSection>
          <PrintTable
            empty="No leave applications."
            head={['#', 'Type', 'Applied', 'Start', 'End', 'Resumption', 'Entitled', 'Approved days', 'Reliever', 'Status']}
            rows={data.records.map((r, i) => [i + 1, r.type, date(r.appliedDate), date(r.startDate), date(r.endDate), date(r.resumeDate), r.entitlement, r.approvedDays, r.relieverName, LEAVE_STATUS_LABELS[r.status] ?? r.status])}
          />
          {(data.balances.length > 0 || data.deferments.length > 0) && (
            <>
              <PrintSection>Balances & deferments</PrintSection>
              <PrintTable
                head={['Kind', 'Year', 'Days', 'Note', 'Status']}
                rows={[
                  ...data.balances.map((b) => ['Legacy balance', b.year, b.weight, b.history, b.active === '1' ? 'Counted' : 'Not counted']),
                  ...data.deferments.map((d) => ['Deferment', d.year, d.weight, d.reason, Number(d.approvedStatus) === 1 ? 'Approved' : Number(d.approvedStatus) === 2 ? 'Rejected' : 'Awaiting']),
                ]}
              />
            </>
          )}
        </>
      )}
    </PrintPage>
  )
}
