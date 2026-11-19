import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api, errorMessage } from '#/lib/api-client'
import { date, dateTime, genderLabel, num } from '#/lib/format'
import { GROUP_LABELS, LEAVE_STATUS_LABELS } from '#/lib/labels'
import { PassportPhoto as Photo } from '#/components/print/photo'
import { PrintPage, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/leave-application/$id')({
  // ?from=portal: a staff member printing their own application from the staff portal.
  validateSearch: z.object({ from: z.enum(['portal']).optional() }),
  head: () => ({ meta: [{ title: 'Leave application · UCC HRMS' }] }),
  component: PrintLeaveApplication,
})

type R = Record<string, any>

function Row2({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="cell w-[38%] font-bold">{label}</td>
      <td className="cell font-sans text-[9.5pt]">{value ?? '—'}</td>
    </tr>
  )
}

function PrintLeaveApplication() {
  const { id } = Route.useParams()
  const { from } = Route.useSearch()
  const { data: l, isLoading, error } = useQuery({
    queryKey: ['leave-application', id, from ?? 'admin'],
    queryFn: () => api.get<R>(from === 'portal' ? `/portal/leave/${id}` : `/leave/records/${id}`),
  })
  const s = (l?.staff ?? {}) as R
  const y = (l?.summary ?? null) as R | null
  return (
    <PrintPage
      title={`Application for ${l?.type ? `${l.type.charAt(0)}${l.type.slice(1).toLowerCase()} ` : ''}Leave`}
      subtitle={l ? `Application #${l.id} · ${LEAVE_STATUS_LABELS[l.status] ?? l.status}` : undefined}
      loading={isLoading}
      error={error ? errorMessage(error) : null}
    >
      {l && (
        <>
          <PrintSection>A. Particulars of applicant</PrintSection>
          <div className="flex items-start gap-4">
            <table className="flex-1 text-[10pt]">
              <tbody>
                <Row2 label="Name" value={s.fullName} />
                <Row2 label="Staff number" value={l.staffNo} />
                <Row2 label="Designation" value={s.jobTitle} />
                <Row2 label="Unit / department" value={s.unitName} />
                <Row2 label="Staff category" value={s.staffGroup ? `${s.staffGroup} — ${GROUP_LABELS[s.staffGroup]}` : null} />
                <Row2 label="Gender" value={genderLabel(s.gender)} />
                <Row2 label="Phone / email" value={[s.phone, s.uccMail].filter(Boolean).join(' · ')} />
              </tbody>
            </table>
            <Photo staffNo={l.staffNo} name={s.fullName ?? ''} />
          </div>

          <PrintSection>B. Leave requested</PrintSection>
          <table className="text-[10pt]">
            <tbody>
              <Row2 label="Type of leave" value={l.type} />
              <Row2 label="Date of application" value={date(l.appliedDate, 'long')} />
              <Row2 label="Leave period" value={`${date(l.startDate, 'long')} to ${date(l.endDate, 'long')}`} />
              <Row2
                label="Leave days requested"
                value={l.approvedDays !== null ? `${l.approvedDays} day${Number(l.approvedDays) === 1 ? '' : 's'}` : null}
              />
              <Row2 label="Date of resumption" value={date(l.resumeDate, 'long')} />
              <Row2 label="Leave status" value={LEAVE_STATUS_LABELS[l.status] ?? l.status} />
              <Row2 label="Reliever" value={l.relievedBy ? `${l.relieverName ?? ''} (${l.relievedBy})` : null} />
              <Row2 label="Address / contact while on leave" value={[l.emergencyNote, l.emergencyContact].filter(Boolean).join(' · ')} />
              {l.applyNote && <Row2 label="Application note" value={<span className="whitespace-pre-line">{l.applyNote}</span>} />}
            </tbody>
          </table>

          {y && l.typeId === 2 && (
            <>
              <PrintSection>C. Annual leave position, {y.year}</PrintSection>
              <PrintTable
                head={['Entitlement', 'Deferred in', 'Legacy balance', 'Constants (+/−)', 'Total', 'Taken', 'Remaining', 'This application']}
                rows={[[num(y.entitlement), num(y.deferred), num(y.balance), `${y.constants > 0 ? '+' : ''}${num(y.constants)}`, <b>{num(y.total)}</b>, num(y.used), <b>{num(y.remaining)}</b>, num(l.approvedDays)]]}
              />
            </>
          )}

          <PrintSection>{y && l.typeId === 2 ? 'D' : 'C'}. Endorsements</PrintSection>
          <table className="print-avoid-break text-[10pt]">
            <tbody>
              <tr className="h-[20mm]">
                <td className="cell w-1/2">
                  <p className="mb-2.5 font-bold">Head of unit</p>
                  <p className="font-sans text-[9.5pt]">{l.headEndorse ? `${l.headName ?? ''} (${l.headEndorse})` : ''}</p>
                  <p className="py-1 font-sans text-[8.5pt] italic">{l.headDate ? `Endorsed on ${date(l.headDate)}` : ''}</p>
                  {l.headRemark && <p className="mt-1 font-sans text-[9pt] italic">{l.headRemark}</p>}
                </td>
                <td className="cell">
                  <p className="mb-2.5 font-bold">Directorate of Human Resource</p>
                  <p className="font-sans text-[9.5pt]">{l.hrEndorse ? `${l.approverName ?? ''} (${l.hrEndorse})` : ''}</p>
                  <p className="py-1 font-sans text-[8.5pt] italic">{l.hrDate ? `Decided on ${date(l.hrDate)}` : ''}</p>
                  {l.hrRemark && <p className="mt-1 font-sans text-[9pt] italic">{l.hrRemark}</p>}
                </td>
              </tr>
              {l.enteredByName && (
                <tr>
                  <td className="cell font-sans text-[9pt] text-slate-600" colSpan={2}>
                    Entered by {l.enteredByName} (HR) on the staff member's behalf{l.updatedAt ? `, last updated ${dateTime(l.updatedAt)}` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </PrintPage>
  )
}
