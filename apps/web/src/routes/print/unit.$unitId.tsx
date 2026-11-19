import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { genderLabel, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/unit/$unitId')({
  head: () => ({ meta: [{ title: 'Unit members · UCC HRMS' }] }),
  component: PrintUnitMembers,
})

function PrintUnitMembers() {
  const { unitId } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['unit-members', unitId],
    queryFn: () => api.get<{ unit: Record<string, any>; members: Array<Record<string, any>> }>(`/units/${unitId}/members`),
  })
  const u = data?.unit
  const groups = ['SM', 'SS', 'JS', null] as const
  return (
    <PrintPage landscape title={u ? `Staff of ${u.longName}` : 'Unit members'} subtitle={data ? `${num(data.members.length)} active staff` : undefined} loading={isLoading} error={error ? errorMessage(error) : null}>
      {u && (
        <>
          <PrintParticulars
            items={[
              ['Unit', `${u.longName}${u.shortName ? ` (${u.shortName})` : ''}`],
              ['Unit ID', u.id],
              ['Parent unit', u.parentName],
              ['Location', u.location],
              ['Head', u.unitHead ? `${u.headName ?? ''} (${u.unitHead})` : null],
              ['Sub-head', u.unitSubhead ? `${u.subheadName ?? ''} (${u.unitSubhead})` : null],
            ]}
          />
          {groups.map((g) => {
            const list = data!.members.filter((m) => (m.staffGroup ?? null) === g)
            if (!list.length) return null
            return (
              <section key={g ?? 'none'} className="print-avoid-break">
                <PrintSection>{g ? GROUP_LABELS[g] : 'Uncategorised'} ({list.length})</PrintSection>
                <PrintTable
                  head={['#', 'Staff no.', 'Name', 'Gender', 'Designation', 'Grade', 'Phone', 'University email']}
                  rows={list.map((m, i) => [i + 1, m.staffNo, m.fullName, genderLabel(m.gender), m.jobTitle, m.grade ? `${m.grade} · ${m.notch}` : null, m.phone, m.uccMail])}
                />
              </section>
            )
          })}
        </>
      )}
    </PrintPage>
  )
}
