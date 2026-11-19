import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { addYears, date } from '#/lib/format'
import { ELEVATION_LABELS, GROUP_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/elevation/$staffNo')({
  head: () => ({ meta: [{ title: 'Appointment & promotion statistics · UCC HRMS' }] }),
  component: PrintElevation,
})

type R = Record<string, any>

function PrintElevation() {
  const { staffNo } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['elevation-history', staffNo],
    queryFn: () => api.get<{ staff: R; records: Array<R>; renewals: Array<R>; postRetire: Array<R> }>(`/elevation/history/${staffNo}`),
  })
  const s = data?.staff
  const count = (t: string) => data?.records.filter((r) => r.applyType === t).length ?? 0
  return (
    <PrintPage landscape title="Appointment & Promotion Statistics" subtitle={s?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {s && data && (
        <>
          <PrintParticulars
            items={[
              ['Name', s.fullName],
              ['Staff number', s.staffNo],
              ['Current designation', s.jobTitle],
              ['Current unit', s.unitName],
              ['Category', s.staffGroup ? GROUP_LABELS[s.staffGroup] : null],
              ['Grade / notch', s.grade ? `${s.grade} · ${s.notch}` : null],
              ['First appointed', date(s.firstAppointDate)],
              ['Date of birth / retirement', `${date(s.dob)} / ${date(s.dob ? addYears(s.dob, 60) : null)}`],
              ['Appointments · promotions · upgrades', `${count('APPOINTMENT')} · ${count('PROMOTION')} · ${count('UPGRADE')}`],
              ['Status', s.staffStatus],
            ]}
          />
          <PrintSection>Appointments, promotions & upgrades</PrintSection>
          <PrintTable
            empty="No records."
            head={['#', 'Type', 'Assumption / effective', 'Letter date', 'Confirmation', 'Probation', 'Designation', 'Grade / notch', 'Category', 'Unit']}
            rows={data.records.map((r, i) => [
              i + 1,
              `${ELEVATION_LABELS[r.applyType]}${r.isCurrent ? ' (current)' : ''}`,
              date(r.appointDate),
              date(r.letterDate),
              date(r.confirmDate),
              r.probation ? `${r.probation} yrs` : null,
              r.jobTitle,
              r.grade ? `${r.grade} · ${r.notch}` : null,
              r.staffGroup,
              r.unitName,
            ])}
          />
          {(data.renewals.length > 0 || data.postRetire.length > 0) && (
            <>
              <PrintSection>Contracts</PrintSection>
              <PrintTable
                head={['Contract', 'Start', 'End', 'Years', 'Status']}
                rows={[
                  ...data.renewals.map((r) => ['Senior member renewal', date(r.startDate), date(r.endDate), r.renewalPeriod, r.active === '1' ? 'Current' : 'Past']),
                  ...data.postRetire.map((r) => ['Post-retirement contract', date(r.startPost), date(r.endPost), r.served, r.active === '1' ? 'Current' : 'Past']),
                ]}
              />
            </>
          )}
        </>
      )}
    </PrintPage>
  )
}
