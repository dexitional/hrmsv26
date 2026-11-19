// The staff member's full profile as an A4 file copy: particulars with the
// passport photo, then every sub-record HR keeps on them.
import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { addYears, date, genderLabel, num } from '#/lib/format'
import { DOC_LABELS, ELEVATION_LABELS, GROUP_LABELS, LEAVE_STATUS_LABELS, MARITAL_LABELS, QUALIFICATION_LABELS, statusLabel } from '#/lib/labels'
import { properName } from '#/lib/text-case'
import { PassportPhoto } from '#/components/print/photo'
import { PrintPage, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/staff/$staffNo')({
  head: () => ({ meta: [{ title: 'Staff profile · UCC HRMS' }] }),
  component: PrintStaffProfile,
})

type R = Record<string, any>

const blank = (v: unknown) => v === null || v === undefined || v === '' || String(v).startsWith('0000')
const show = (v: unknown) => (blank(v) ? '—' : (v as React.ReactNode))
const yes = (v: unknown) => v === '1' || v === 1 || v === true
/** Bank account numbers are printed with all but the last four digits hidden. */
const masked = (acc: string | null | undefined) => (acc ? `•••• ${String(acc).slice(-4)}` : '—')

/** Label/value pairs in two columns: [label, value, label, value] per row. */
function Pairs({ items }: { items: Array<[string, React.ReactNode]> }) {
  const rows: Array<Array<[string, React.ReactNode]>> = []
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2))
  return (
    <table className="text-[9.5pt]">
      <tbody>
        {rows.map((pair, i) => (
          <tr key={i}>
            {pair.map(([label, value]) => (
              <td key={label} className="cell w-1/2">
                <span className="font-bold">{label}:</span> <span className="font-sans text-[9pt]">{show(value)}</span>
              </td>
            ))}
            {pair.length === 1 && <td className="cell w-1/2" />}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PrintStaffProfile() {
  const { staffNo } = Route.useParams()
  const [profile, relatives, banks, quals, disciplinary] = useQueries({
    queries: [
      { queryKey: ['staff', staffNo], queryFn: () => api.get<R>(`/staff/${staffNo}`) },
      { queryKey: ['relatives', staffNo], queryFn: () => api.get<Array<R>>(`/staff-records/${staffNo}/relatives`) },
      { queryKey: ['banks', staffNo], queryFn: () => api.get<Array<R>>(`/staff-records/${staffNo}/banks`) },
      { queryKey: ['qualifications', staffNo], queryFn: () => api.get<Array<R>>(`/staff-records/${staffNo}/qualifications`) },
      { queryKey: ['disciplinary-history', staffNo], queryFn: () => api.get<{ records: Array<R> }>(`/disciplinary/history/${staffNo}`), retry: false },
    ],
  })
  const s = profile.data
  const loading = profile.isLoading || relatives.isLoading || banks.isLoading || quals.isLoading
  const leave = s?.leave as R | undefined
  const rels = (relatives.data ?? []).filter((r) => yes(r.active))
  const relName = (r: R) => properName([r.fname, r.mname, r.lname].filter(Boolean).join(' '))

  return (
    <PrintPage title="Staff Profile" subtitle={s ? `${s.fullName} · Staff ${s.staffNo}` : undefined} loading={loading} error={profile.error ? errorMessage(profile.error) : null}>
      {s && (
        <>
          {/* A. Particulars, with the photo */}
          <section className="print-avoid-break">
            <h2 className="mt-1 mb-2 text-[11pt] font-bold uppercase">Particulars</h2>
            <div className="flex items-start gap-4">
              <table className="flex-1 text-[9.5pt]">
                <tbody>
                  {(
                    [
                      ['Full name', s.fullName],
                      ['Staff number', s.staffNo],
                      ['Designation', s.jobTitle],
                      ['Unit / department', s.unitName],
                      ['Staff category', s.curStaffGroup ? `${s.curStaffGroup} — ${GROUP_LABELS[s.curStaffGroup]}` : null],
                      ['Grade / notch', s.grade ? `${s.grade} · Notch ${s.notch}` : null],
                      ['Employment status', s.staffStatus ? statusLabel(s.staffStatus) : null],
                    ] as Array<[string, unknown]>
                  ).map(([label, value]) => (
                    <tr key={label}>
                      <td className="cell w-[36%] font-bold">{label}</td>
                      <td className="cell font-sans text-[9pt]">{show(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PassportPhoto staffNo={s.staffNo} name={s.fullName ?? ''} />
            </div>
          </section>

          <PrintSection>Personal information</PrintSection>
          <Pairs
            items={[
              ['Gender', genderLabel(s.gender)],
              ['Date of birth', blank(s.dob) ? null : `${date(s.dob, 'long')} (${s.age} years)`],
              ['Marital status', s.mstatus ? MARITAL_LABELS[s.mstatus] : null],
              ['Nationality', s.nationality ?? s.country],
              ['Hometown', s.hometown],
              ['District / region', [s.district, s.region].filter(Boolean).join(', ')],
              ['Ghana Card', s.ghanaCardNo],
              ['SSNIT number', s.ssnit],
            ]}
          />

          <PrintSection>Contact & emergency</PrintSection>
          <Pairs
            items={[
              ['University email', s.uccMail],
              ['Personal email', s.email],
              ['Phone', s.phone],
              ['Residential address', s.address],
              ['Permanent address', s.paddress],
              [
                'Emergency contact',
                s.emergencyName || s.emergencyPhone
                  ? [s.emergencyName, s.emergencyRelation && `(${s.emergencyRelation})`, s.emergencyPhone, s.emergencyAddress].filter(Boolean).join(' ')
                  : s.emergencyContact,
              ],
            ]}
          />

          <PrintSection>Employment</PrintSection>
          <Pairs
            items={[
              ['First appointment', date(s.firstAppointDate, 'long')],
              ['Assumption of duty', date(s.assumeDate, 'long')],
              ['Probation', s.probation ? `${s.probation} year${Number(s.probation) === 1 ? '' : 's'}` : null],
              ['Confirmation', date(s.confirmDate, 'long')],
              ['Current record', s.currentType ? `${ELEVATION_LABELS[s.currentType]} since ${date(s.currentSince)}` : null],
              ['Retirement (age 60)', blank(s.dob) ? null : date(addYears(s.dob, 60), 'long')],
              ['Exit', s.exitDate ? `${date(s.exitDate)}${s.exitRemark ? ` — ${s.exitRemark}` : ''}` : null],
              ['Leave status', Number(s.flagLeave) === 1 ? 'On leave' : Number(s.flagLeave) === 2 ? 'Relieving a colleague' : 'At post'],
            ]}
          />

          <PrintSection>Appointments, promotions & upgrades</PrintSection>
          <PrintTable
            empty="No appointment records."
            head={['Type', 'Date', 'Designation', 'Grade', 'Unit', 'Confirmed']}
            rows={(s.elevations as Array<R>).map((e) => [
              `${ELEVATION_LABELS[e.applyType ?? 'APPOINTMENT']}${e.isCurrent ? ' (current)' : ''}`,
              date(e.appointDate),
              e.jobTitle,
              e.grade ? `${e.grade} · ${e.notch}` : null,
              e.unitName,
              date(e.confirmDate),
            ])}
          />

          <PrintSection>Qualifications</PrintSection>
          <PrintTable
            empty="No qualifications recorded."
            head={['Qualification', 'Programme', 'Specialization', 'Institution', 'Awarded', 'Verified']}
            rows={(quals.data ?? []).map((q) => [QUALIFICATION_LABELS[q.certRate] ?? q.certRate, q.qualify, q.specialize, q.institution, date(q.gradDate), q.verified === '1' ? 'Yes' : 'No'])}
          />

          <PrintSection>Relatives</PrintSection>
          <PrintTable
            empty="No relatives recorded."
            head={['Relation', 'Name', 'Date of birth', 'Gender', 'Code', 'Contact', 'Alive', 'Next of kin']}
            rows={rels.map((r) => [
              statusLabel(r.relation ?? ''),
              relName(r),
              date(r.dob),
              genderLabel(r.gender),
              r.code,
              r.phone,
              yes(r.alive) ? 'Yes' : 'No',
              yes(r.kin) ? 'Yes' : '',
            ])}
          />

          <PrintSection>Bank accounts</PrintSection>
          <PrintTable
            empty="No bank accounts recorded."
            head={['Bank', 'Account number', 'Branch', 'Added', 'Salary account']}
            rows={(banks.data ?? []).map((b) => [b.bankName, masked(b.accountNo), b.accountBranch, date(b.dateAdded), b.isDefault ? 'Default' : ''])}
          />

          <PrintSection>Positions held</PrintSection>
          <PrintTable
            empty="No positions held."
            head={['Position', 'Unit', 'From', 'To', 'Status']}
            rows={(s.positions as Array<R>).map((p) => [p.title, p.unitName, date(p.startDate), date(p.endDate), p.active === '1' ? (Number(p.daysLeft) < 0 ? 'Past end date' : 'Current') : 'Ended'])}
          />

          <PrintSection>Transfers</PrintSection>
          <PrintTable
            empty="No transfers."
            head={['Date', 'From', 'To', 'Reason']}
            rows={(s.transfers as Array<R>).map((t) => [date(t.transferDate), t.fromUnitName, t.toUnitName, t.reason])}
          />

          {(s.renewals.length > 0 || s.postRetire.length > 0) && (
            <>
              <PrintSection>Contracts</PrintSection>
              <PrintTable
                head={['Contract', 'Start', 'End', 'Years', 'Status']}
                rows={[
                  ...(s.renewals as Array<R>).map((r) => ['Senior member renewal', date(r.startDate), date(r.endDate), r.renewalPeriod, r.active === '1' ? 'Current' : 'Past']),
                  ...(s.postRetire as Array<R>).map((r) => ['Post-retirement contract', date(r.startPost), date(r.endPost), r.served, r.active === '1' ? 'Current' : 'Past']),
                ]}
              />
            </>
          )}

          <PrintSection>Leave</PrintSection>
          {leave && (
            <PrintTable
              head={['Annual leave', 'Entitlement', 'Deferred in', 'Balance', 'Constants', 'Total', 'Taken', 'Remaining']}
              rows={[[String(leave.year), num(leave.entitlement), num(leave.deferred), num(leave.balance), `${leave.constants > 0 ? '+' : ''}${num(leave.constants)}`, num(leave.total), num(leave.used), num(leave.remaining)]]}
            />
          )}
          <PrintTable
            className="mt-2"
            empty="No leave records."
            head={['Type', 'Start', 'End', 'Days', 'Status']}
            rows={(s.leaves as Array<R>).map((l) => [l.type, date(l.startDate), date(l.endDate), l.approvedDays, LEAVE_STATUS_LABELS[l.status] ?? l.status])}
          />

          <PrintSection>Disciplinary record</PrintSection>
          <PrintTable
            empty="No disciplinary action on record."
            head={['Date issued', 'Action', 'Reason']}
            rows={(disciplinary.data?.records ?? []).map((d) => [date(d.issueDate), statusLabel(d.actionType ?? ''), d.reason])}
          />

          <PrintSection>Documents on file</PrintSection>
          <PrintTable
            head={['Document', 'Status']}
            rows={(['MARITAL', 'BIRTH', 'MEDICAL', 'CV'] as const).map((cat) => {
              const d = (s.docs as Array<R>).find((x) => x.category === cat)
              return [DOC_LABELS[cat], d ? (d.path?.startsWith('/api/files/') ? 'Uploaded' : 'On the staff portal') : 'Not uploaded']
            })}
          />
        </>
      )}
    </PrintPage>
  )
}
