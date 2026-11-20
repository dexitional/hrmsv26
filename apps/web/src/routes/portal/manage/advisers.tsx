// Academic Advisor manager: the advisers a head has nominated for the academic
// year (with the VC's decision), and the academic staff in their units who
// could be nominated. Nominating names a programme and level; the number of
// continuing students comes from the student system.
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { GraduationCap, Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { ADVISER_LEVELS } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { NativeSelect } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'

export const Route = createFileRoute('/portal/manage/advisers')({ component: AdvisersManager })

type R = Record<string, any>
type Data = { year: string; years: Array<string>; advisers: Array<R>; candidates: Array<R>; programmes: Array<{ value: string; label: string }> }

/** Legacy status: 1 waiting for the VC, 2 approved, 3 not approved. */
function AdviserStatus({ status }: { status: number | null | undefined }) {
  const s = Number(status)
  if (s === 2) return <Badge tone="success">Approved by the VC</Badge>
  if (s === 3) return <Badge tone="danger">Not approved</Badge>
  if (s === 1) return <Badge tone="warning">Waiting for the VC</Badge>
  return <Badge dot={false}>Not nominated</Badge>
}

function AdvisersManager() {
  const [year, setYear] = useState('')
  const [tab, setTab] = useState<'advisers' | 'candidates'>('advisers')
  const [q, setQ] = useState('')
  const [nominating, setNominating] = useState<R | null>(null)
  const { confirm, dialog } = useConfirm()
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'manage-advisers', year],
    queryFn: () => api.get<Data>('/portal/manage/advisers', { year: year || undefined }),
    placeholderData: keepPreviousData,
  })
  const withdraw = useSave((id: number) => api.delete(`/portal/manage/advisers/${id}`), { invalidate: ['portal'], success: 'Nomination withdrawn' })
  const current = data ? data.year === data.years[0] : true
  const match = (r: R) => !q || `${r.fullName} ${r.staffNo} ${r.unitName ?? ''} ${r.programme ?? ''}`.toLowerCase().includes(q.toLowerCase())
  const advisers = (data?.advisers ?? []).filter(match)
  const candidates = (data?.candidates ?? []).filter(match)
  return (
    <>
      {dialog}
      <NominateDialog staff={nominating} programmes={data?.programmes ?? []} onClose={() => setNominating(null)} />
      <PageHeader
        eyebrow="Management services"
        title="Academic Advisor manager"
        description="Nominate academic staff in your units as academic advisers for a programme and level. The Vice-Chancellor’s office approves each nomination."
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['Nominated', data?.advisers.length],
            ['Approved', data?.advisers.filter((a) => Number(a.status) === 2).length],
            ['Waiting for the VC', data?.advisers.filter((a) => Number(a.status) === 1).length],
            ['Potential advisers', data?.candidates.filter((c) => !c.adviserId).length],
          ] as Array<[string, number | undefined]>
        ).map(([label, v], i) => (
          <div key={label} className={i === 0 ? 'rounded-xl bg-primary px-4 py-3 text-white' : 'rounded-xl border bg-white px-4 py-3'}>
            <p className={i === 0 ? 'eyebrow text-white/70' : 'eyebrow'}>{label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{v === undefined ? '—' : num(v)}</p>
          </div>
        ))}
      </div>
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {(
          [
            ['advisers', 'Nominated advisers', data?.advisers.length],
            ['candidates', 'Potential advisers', data?.candidates.length],
          ] as Array<['advisers' | 'candidates', string, number | undefined]>
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              tab === value ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong',
            )}
          >
            {label}
            {count !== undefined && <span className={cn('rounded-full px-1.5 font-mono text-[0.65rem]', tab === value ? 'bg-white/15' : 'bg-muted')}>{count}</span>}
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Name, staff number, unit or programme…" />
        <FilterSelect label="Academic year" value={year || data?.year || ''} onChange={setYear} options={(data?.years ?? []).map((y) => ({ value: y, label: y }))} />
      </Toolbar>
      {tab === 'advisers' ? (
        <DataTable
          loading={isLoading}
          rows={advisers}
          empty={<EmptyState icon={GraduationCap} title="No advisers nominated" description={current ? 'Nominate advisers from Potential advisers.' : undefined} />}
          columns={[
            { header: 'Adviser', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
            { header: 'Programme', cell: (r: R) => <span className="block max-w-72 text-sm">{r.programme ?? '—'}</span> },
            { header: 'Level', cell: (r: R) => <span className="font-mono text-xs">{r.level ?? '—'}</span> },
            { header: 'Students', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{r.totalStudents ? num(Number(r.totalStudents)) : '—'}</span> },
            { header: 'Nominated', cell: (r: R) => <span className="text-xs whitespace-nowrap text-slate-600">{date(r.dateAss)}</span> },
            { header: 'Status', cell: (r: R) => <AdviserStatus status={r.status} /> },
            {
              header: '',
              align: 'right',
              cell: (r: R) =>
                current && Number(r.status) !== 2 ? (
                  <RowActions
                    actions={[
                      { label: 'Change programme or level', icon: Pencil, onSelect: () => setNominating(r) },
                      {
                        label: 'Withdraw nomination',
                        icon: Trash2,
                        danger: true,
                        onSelect: () =>
                          confirm({
                            title: 'Withdraw this nomination?',
                            description: `${r.fullName} will no longer be put forward as an adviser for ${data?.year}.`,
                            confirmLabel: 'Withdraw',
                            danger: true,
                            onConfirm: () => withdraw.mutateAsync(r.id),
                          }),
                      },
                    ]}
                  />
                ) : null,
            },
          ]}
        />
      ) : (
        <DataTable
          loading={isLoading}
          rows={candidates}
          empty={<EmptyState icon={Users} title="No academic staff in your units" />}
          columns={[
            { header: 'Staff', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
            { header: 'Unit', cell: (r: R) => <span className="block max-w-56 truncate text-xs text-slate-600">{r.unitName}</span> },
            { header: 'This year', cell: (r: R) => (r.adviserId ? <span className="text-xs">{r.programme ?? r.progid} · level {r.level}</span> : <span className="text-xs text-muted-foreground">—</span>) },
            { header: 'Status', cell: (r: R) => <AdviserStatus status={r.adviserId ? r.status : null} /> },
            {
              header: '',
              align: 'right',
              cell: (r: R) =>
                current && Number(r.status) !== 2 ? (
                  <Button size="sm" variant={r.adviserId ? 'outline' : 'default'} onClick={() => setNominating(r)}>
                    {r.adviserId ? <Pencil /> : <UserPlus />} {r.adviserId ? 'Change' : 'Nominate'}
                  </Button>
                ) : null,
            },
          ]}
        />
      )}
    </>
  )
}

function NominateDialog({ staff, programmes, onClose }: { staff: R | null; programmes: Array<{ value: string; label: string }>; onClose: () => void }) {
  const [progid, setProgid] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState<string | null>(null)
  // Start from the current nomination when changing one.
  const id = staff ? `${staff.staffNo}` : null
  if (id !== key) {
    setKey(id)
    setProgid(staff?.progid ?? '')
    setLevel(staff?.level ? String(staff.level) : '')
    setError(null)
  }
  const save = useSave((v: { staffNo: number; progid: string; level: number }) => api.post<{ totalStudents: number | null }>('/portal/manage/advisers', v), {
    invalidate: ['portal'],
    success: (r) => `Nominated${r.totalStudents !== null ? ` · ${num(r.totalStudents)} students on the programme and level` : ''}. It now waits for the VC.`,
    onDone: onClose,
    onError: setError,
  })
  const options = programmes.map((p, i) => ({ value: i + 1, label: p.label, hint: p.value }))
  const selected = programmes.findIndex((p) => p.value === progid) + 1
  return (
    <FormDialog
      open={Boolean(staff)}
      onOpenChange={(o) => !o && onClose()}
      title={staff?.adviserId ? 'Change adviser nomination' : 'Nominate an academic adviser'}
      description={staff ? `${staff.fullName} (${staff.staffNo}) · ${staff.unitName ?? ''}` : undefined}
      submitLabel="Nominate"
      busy={save.isPending}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        if (!progid) return setError('Choose the programme.')
        if (!level) return setError('Choose the level.')
        save.mutate({ staffNo: Number(staff!.staffNo), progid, level: Number(level) })
      }}
    >
      <Field label="Programme" required className="sm:col-span-2" hint={programmes.length ? 'Undergraduate programmes of your department.' : 'Your department’s programmes could not be loaded from the student system.'}>
        <Combobox options={options} value={selected || null} onChange={(v) => setProgid(v ? programmes[v - 1]!.value : '')} placeholder="Choose the programme…" />
      </Field>
      <Field label="Level" required>
        <NativeSelect value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Choose…</option>
          {ADVISER_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormDialog>
  )
}
