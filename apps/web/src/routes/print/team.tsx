// A head's staff list from the staff portal's Staff manager, with the same
// filters (search, unit, category, on leave now), grouped by staff category.
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api, errorMessage } from '#/lib/api-client'
import { genderLabel, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/team')({
  validateSearch: z.object({
    q: z.string().optional(),
    unit: z.coerce.number().int().optional(),
    group: z.string().optional(),
    onLeave: z.literal('1').optional(),
  }),
  head: () => ({ meta: [{ title: 'Staff list · UCC Staff Portal' }] }),
  component: PrintTeam,
})

type R = Record<string, any>
const GROUPS = ['SM', 'SS', 'JS', null] as const

function PrintTeam() {
  const search = Route.useSearch()
  const scope = useQuery({ queryKey: ['portal', 'manage-scope'], queryFn: () => api.get<R>('/portal/manage/scope') })
  const list = useQuery({
    queryKey: ['portal', 'manage-staff-print', search],
    queryFn: () => api.get<{ data: Array<R>; total: number }>('/portal/manage/staff', { ...search, all: '1' }),
  })
  const members = list.data?.data ?? []
  const s = scope.data
  const unitName = search.unit ? (s?.units as Array<R> | undefined)?.find((u) => u.value === search.unit)?.label : null
  const filters = [
    unitName && `Unit: ${unitName}`,
    search.group && `Category: ${GROUP_LABELS[search.group] ?? search.group}`,
    search.onLeave && 'On leave now',
    search.q && `Matching “${search.q}”`,
  ].filter(Boolean)
  const error = list.error ?? scope.error
  return (
    <PrintPage
      landscape
      title={search.onLeave ? 'Staff on leave' : 'Staff list'}
      subtitle={list.data ? `${num(members.length)} staff member${members.length === 1 ? '' : 's'}${filters.length ? ` · ${filters.join(' · ')}` : ''}` : undefined}
      loading={list.isLoading || scope.isLoading}
      error={error ? errorMessage(error) : null}
      backTo="/portal/manage/staff"
    >
      {s && (
        <>
          <PrintParticulars
            items={[
              ['Head / approver', s.headTitle ?? 'Approver'],
              ['Units', (s.heads as Array<R>).map((h) => h.unitName).join(', ') || 'Named approver'],
              ['Staff listed', num(members.length)],
              ['Filters', filters.length ? filters.join('; ') : 'None (all my staff)'],
            ]}
          />
          {GROUPS.map((g) => {
            const rows = members.filter((m) => (m.staffGroup ?? null) === g)
            if (!rows.length) return null
            return (
              <section key={g ?? 'none'}>
                <PrintSection>
                  {g ? GROUP_LABELS[g] : 'Uncategorised'} ({rows.length})
                </PrintSection>
                <PrintTable
                  head={['#', 'Staff no.', 'Name', 'Gender', 'Designation', 'Unit', 'Grade', 'Phone', 'University email', 'Status']}
                  rows={rows.map((m, i) => [
                    i + 1,
                    m.staffNo,
                    m.fullName,
                    genderLabel(m.gender),
                    m.jobTitle,
                    m.unitName,
                    m.grade ? `${m.grade} · ${m.notch}` : null,
                    m.phone,
                    m.uccMail,
                    Number(m.flagLeave) === 1 ? 'On leave' : m.staffStatus ? m.staffStatus.charAt(0) + m.staffStatus.slice(1).toLowerCase() : null,
                  ])}
                  empty="No staff match."
                />
              </section>
            )
          })}
          {!members.length && <p className="text-center italic">No staff match these filters.</p>}
        </>
      )}
    </PrintPage>
  )
}
