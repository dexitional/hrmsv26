import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, PenLine } from 'lucide-react'
import { api } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { StatCard } from '#/components/admin/charts'
import { FormAStatus, FormBStatus } from '#/components/appraisal/shared'

export const Route = createFileRoute('/portal/manage/appraisals/')({ component: AppraisalManager })

type R = Record<string, any>
const YEARS = Array.from({ length: 4 }, (_, i) => String(new Date().getFullYear() - i))

function AppraisalManager() {
  const navigate = useNavigate()
  const [year, setYear] = useState(YEARS[0]!)
  const [q, setQ] = useState('')
  const [show, setShow] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'manage-appraisals', year], queryFn: () => api.get<{ data: Array<R>; counts: R }>('/portal/manage/appraisals', { year }) })
  const rows = (data?.data ?? []).filter(
    (r) =>
      (!q || `${r.fullName} ${r.staffNo}`.toLowerCase().includes(q.toLowerCase())) &&
      (show === '' || (show === 'countersign' && r.formB?.status === 1) || (show === 'form-a' && !r.formA) || (show === 'done' && r.formA?.status >= 2)),
  )
  const open = (r: R) => navigate({ to: '/portal/manage/appraisals/$staffNo/$year', params: { staffNo: String(r.staffNo), year } })
  return (
    <>
      <PageHeader eyebrow="Management services" title="Appraisal manager" description="Countersign your staff’s self-appraisals (Form B) and complete their appraisals (Form A)." />
      {data && (
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3 [&>*]:min-w-0">
          <StatCard accent icon={PenLine} label="To countersign" value={data.counts.toCountersign} sub="Self-appraisals waiting for you" />
          <StatCard icon={ClipboardCheck} label="Form A completed" value={data.counts.formADone} sub={`for ${year}`} />
          <StatCard icon={ClipboardCheck} label="Form A not started" value={data.counts.formAPending} sub={`for ${year}`} />
        </div>
      )}
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Name or staff number…" />
        <FilterSelect label="Year under review" value={year} onChange={(v) => setYear(v || YEARS[0]!)} options={YEARS.map((y) => ({ value: y, label: y }))} />
        <FilterSelect
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { value: 'countersign', label: 'Waiting for my countersignature' },
            { value: 'form-a', label: 'Form A not started' },
            { value: 'done', label: 'Completed and signed' },
          ]}
        />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={rows}
        empty={<EmptyState icon={ClipboardCheck} title="No staff to show" />}
        columns={[
          { header: 'Staff', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
          { header: 'Unit', cell: (r: R) => <span className="block max-w-48 truncate text-xs">{r.unitName}</span> },
          { header: 'Self-appraisal (B)', cell: (r: R) => <FormBStatus status={r.formB?.status} /> },
          { header: 'Appraisal (A)', cell: (r: R) => <FormAStatus status={r.formA?.status} /> },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <Button size="sm" variant={r.formB?.status === 1 || !r.formA ? 'default' : 'outline'} onClick={() => open(r)}>
                {r.formB?.status === 1 ? 'Countersign' : !r.formA ? 'Appraise' : 'Open'}
              </Button>
            ),
          },
        ]}
      />
    </>
  )
}
