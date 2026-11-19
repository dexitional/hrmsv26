import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api, errorMessage } from '#/lib/api-client'
import { num } from '#/lib/format'
import { UNIT_LEVEL_LABELS } from '#/lib/labels'
import { PrintPage, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/units')({
  validateSearch: z.object({ status: z.string().optional(), type: z.string().optional() }),
  head: () => ({ meta: [{ title: 'Units & offices · UCC HRMS' }] }),
  component: PrintUnits,
})

function PrintUnits() {
  const { status, type } = Route.useSearch()
  const { data, isLoading, error } = useQuery({ queryKey: ['units'], queryFn: () => api.get<Array<Record<string, any>>>('/units') })
  const rows = (data ?? []).filter((u) => (!status || u.active === status) && (!type || u.type === type))
  return (
    <PrintPage
      landscape
      title="List of Units & Offices"
      subtitle={`${num(rows.length)} ${status === '0' ? 'inactive' : status === '1' ? 'active' : ''} units${type ? ` · ${type.toLowerCase()}` : ''}`}
      loading={isLoading}
      error={error ? errorMessage(error) : null}
    >
      <PrintTable
        head={['ID', 'Unit', 'Short', 'Type / level', 'Parent unit', 'Head', 'Sub-head', 'Staff']}
        rows={rows.map((u) => [
          u.id,
          u.longName,
          u.shortName,
          [u.type === 'ACADEMIC' ? 'Academic' : u.type ? 'Non-academic' : null, u.level ? UNIT_LEVEL_LABELS[u.level] : null].filter(Boolean).join(' · '),
          u.parentName,
          u.unitHead ? `${u.headName ?? ''} (${u.unitHead})` : null,
          u.unitSubhead ? `${u.subheadName ?? ''} (${u.unitSubhead})` : null,
          num(u.memberCount),
        ])}
      />
    </PrintPage>
  )
}
