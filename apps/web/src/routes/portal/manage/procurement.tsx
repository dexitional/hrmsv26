// Procurement manager: the procurement requests filed for the units a head
// heads (drafts included), requests from the units below them (read-only),
// and the request form: items with category, description, quantity and unit
// price; saved as a draft or submitted to the Procurement Directorate.
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Eye, Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { procurementRequestSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'

export const Route = createFileRoute('/portal/manage/procurement')({ component: ProcurementManager })

type R = Record<string, any>
type In = z.input<typeof procurementRequestSchema>
type Data = { units: Array<{ value: number; label: string }>; categories: Array<{ value: number; label: string }>; requests: Array<R>; below: Array<R> }

const cedis = (v: unknown) => Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const STAGES: Record<number, string> = { 1: 'Head of unit', 2: 'Dean / director', 3: 'Provost / registrar', 4: 'Procurement Directorate', 5: 'Tender committee' }

function RequestStatus({ status, stage }: { status: number; stage: number | string }) {
  const s = Number(status)
  if (s === 0) return <Badge dot={false}>Draft</Badge>
  if (s === 9) return <Badge tone="success">Completed</Badge>
  return <Badge tone="info">{STAGES[Number(stage)] ? `With the ${STAGES[Number(stage)]}` : 'Submitted'}</Badge>
}

function ProcurementManager() {
  const [tab, setTab] = useState<'mine' | 'below'>('mine')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<{ id: number | null } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const { confirm, dialog } = useConfirm()
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'manage-procurement'], queryFn: () => api.get<Data>('/portal/manage/procurement') })
  const remove = useSave((id: number) => api.delete(`/portal/manage/procurement/${id}`), { invalidate: ['portal'], success: 'Draft deleted' })
  const match = (r: R) => !q || `${r.orderNo} ${r.unitName} ${r.fullName ?? ''}`.toLowerCase().includes(q.toLowerCase())
  const list = (tab === 'mine' ? (data?.requests ?? []) : (data?.below ?? [])).filter(match)
  return (
    <>
      {dialog}
      {editing && data && <RequestDialog id={editing.id} units={data.units} categories={data.categories} onClose={() => setEditing(null)} />}
      <ViewDialog id={viewing} onClose={() => setViewing(null)} />
      <PageHeader
        eyebrow="Management services"
        title="Procurement manager"
        description="Requests for goods, works and services raised for your unit. Submitted requests go to the Procurement Directorate."
        actions={
          (data?.units.length ?? 0) > 0 && (
            <Button onClick={() => setEditing({ id: null })}>
              <Plus /> New request
            </Button>
          )
        }
      />
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {(
          [
            ['mine', 'My unit’s requests', data?.requests.length],
            ['below', 'Units under me', data?.below.length],
          ] as Array<['mine' | 'below', string, number | undefined]>
        )
          .filter(([v]) => v === 'mine' || (data?.below.length ?? 0) > 0)
          .map(([value, label, count]) => (
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
        <SearchInput value={q} onChange={setQ} placeholder="Order number, unit or name…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={list}
        empty={<EmptyState icon={ShoppingCart} title="No procurement requests" description={tab === 'mine' && data?.units.length ? 'Raise a request for your unit with New request.' : undefined} />}
        columns={[
          { header: 'Order no.', cell: (r: R) => <span className="font-mono text-xs">{r.orderNo}</span> },
          { header: 'Unit', cell: (r: R) => <span className="block max-w-48 truncate text-xs text-slate-600">{r.unitName}</span> },
          { header: 'Raised by', cell: (r: R) => <span className="block max-w-40 truncate text-xs">{r.fullName ?? r.staffNo}</span> },
          { header: 'Date', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.requestDate ?? r.dateAdded)}</span> },
          { header: 'Items', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{r.items}</span> },
          { header: 'Total (GHS)', align: 'right', cell: (r: R) => <span className="font-mono text-xs font-semibold">{cedis(r.total)}</span> },
          { header: 'Status', cell: (r: R) => <RequestStatus status={r.status} stage={r.stage} /> },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <RowActions
                actions={[
                  { label: 'View request', icon: Eye, onSelect: () => setViewing(r.id) },
                  { label: 'Edit / submit draft', icon: Pencil, hidden: !r.editable, onSelect: () => setEditing({ id: r.id }) },
                  {
                    label: 'Delete draft',
                    icon: Trash2,
                    danger: true,
                    hidden: !r.editable,
                    onSelect: () => confirm({ title: 'Delete this draft?', description: `Order ${r.orderNo} and its items are removed.`, confirmLabel: 'Delete', danger: true, onConfirm: () => remove.mutateAsync(r.id) }),
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

const EMPTY_ITEM = { categoryId: '' as never, description: '', quantity: '' as never, unitPrice: '' as never }

function RequestDialog({ id, units, categories, onClose }: { id: number | null; units: Data['units']; categories: Data['categories']; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const existing = useQuery({ queryKey: ['portal', 'procurement-request', id], queryFn: () => api.get<R>(`/portal/manage/procurement/${id}`), enabled: id !== null })
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<In>({
    resolver: zodResolver(procurementRequestSchema),
    defaultValues: { unitId: (units.length === 1 ? units[0]!.value : '') as never, items: [EMPTY_ITEM], submit: false },
  })
  const items = useFieldArray({ control, name: 'items' })
  useEffect(() => {
    const r = existing.data
    if (!r) return
    reset({
      unitId: r.unitId,
      items: (r.items as Array<R>).length
        ? (r.items as Array<R>).map((i) => ({ categoryId: i.categoryId ?? '', description: i.description ?? '', quantity: i.quantity ?? '', unitPrice: i.unitPrice ?? '' }))
        : [EMPTY_ITEM],
      submit: false,
    } as In)
  }, [existing.data, reset])
  const rows = watch('items') ?? []
  const lineTotal = (i: number) => (Number(rows[i]?.quantity) || 0) * (Number(rows[i]?.unitPrice) || 0)
  const total = rows.reduce((t, _, i) => t + lineTotal(i), 0)
  const save = useSave((v: In) => (id ? api.put<{ id: number }>(`/portal/manage/procurement/${id}`, v) : api.post<{ id: number }>('/portal/manage/procurement', v)), {
    invalidate: ['portal'],
    success: () => (watch('submit') ? 'Request submitted to the Procurement Directorate' : 'Draft saved'),
    onDone: onClose,
    onError: setError,
  })
  const go = (submit: boolean) => {
    setValue('submit', submit)
    setError(null)
    void handleSubmit((v) => save.mutate({ ...v, submit }))()
  }
  const itemErr = (i: number, k: string) => (errors.items?.[i] as Record<string, { message?: string }> | undefined)?.[k]?.message
  return (
    <FormDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={id ? `Procurement request ${existing.data?.orderNo ?? ''}` : 'Request for procurement of items'}
      description="List each item with its category, description, quantity and unit price. Save it as a draft, or submit it to the Procurement Directorate."
      submitLabel="Submit request"
      busy={save.isPending}
      error={error}
      wide
      onSubmit={(e) => (e.preventDefault(), go(true))}
    >
      <Field label="Unit" required error={(errors.unitId as { message?: string } | undefined)?.message} className="sm:col-span-2">
        <NativeSelect {...register('unitId')} disabled={id !== null}>
          <option value="">Choose…</option>
          {units.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div className="space-y-3 sm:col-span-2">
        {items.fields.map((f, i) => (
          <div key={f.id} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">Item {i + 1}</p>
              {items.fields.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => items.remove(i)} aria-label={`Remove item ${i + 1}`}>
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_9rem]">
              <Field label="Item category" required error={itemErr(i, 'categoryId')} className="sm:col-span-4">
                <NativeSelect {...register(`items.${i}.categoryId`)}>
                  <option value="">Choose the category…</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Description" required error={itemErr(i, 'description')}>
                <Textarea rows={1} {...register(`items.${i}.description`)} placeholder="e.g. HP LaserJet Pro printer" />
              </Field>
              <Field label="Quantity" required error={itemErr(i, 'quantity')}>
                <Input type="number" min={1} step={1} inputMode="numeric" {...register(`items.${i}.quantity`)} />
              </Field>
              <Field label="Unit price (GHS)" required error={itemErr(i, 'unitPrice')}>
                <Input type="number" min={0} step="0.01" inputMode="decimal" {...register(`items.${i}.unitPrice`)} />
              </Field>
              <Field label="Total price">
                <Input value={cedis(lineTotal(i))} readOnly disabled className="bg-slate-50 text-right font-mono" />
              </Field>
            </div>
          </div>
        ))}
        {errors.items?.message && <p className="text-xs font-medium text-destructive">{errors.items.message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => items.append(EMPTY_ITEM)}>
            <Plus /> Add item
          </Button>
          <p className="text-sm">
            Total: <b className="font-mono text-base">GHS {cedis(total)}</b>
          </p>
        </div>
        <div className="flex justify-end border-t pt-3">
          <Button type="button" variant="outline" disabled={save.isPending} onClick={() => go(false)}>
            Save and continue later
          </Button>
        </div>
      </div>
    </FormDialog>
  )
}

function ViewDialog({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data: r } = useQuery({ queryKey: ['portal', 'procurement-request', id], queryFn: () => api.get<R>(`/portal/manage/procurement/${id}`), enabled: id !== null })
  const total = ((r?.items ?? []) as Array<R>).reduce((t, i) => t + Number(i.totalPrice ?? 0), 0)
  return (
    <Dialog open={id !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl"
        title={r ? `Procurement request ${r.orderNo}` : 'Procurement request'}
        description={r ? `${r.unitName} · raised by ${r.fullName ?? r.staffNo} · ${date(r.requestDate ?? r.dateAdded, 'long')}` : undefined}
      >
        {r && (
          <div className="space-y-5">
            <RequestStatus status={r.status} stage={r.stage} />
            <DataTable
              rows={(r.items as Array<R>).map((i, n) => ({ ...i, n: n + 1 }))}
              empty={<p className="p-4 text-sm text-muted-foreground">No items.</p>}
              columns={[
                { header: '#', cell: (i: R) => <span className="font-mono text-xs">{i.n}</span> },
                { header: 'Category', cell: (i: R) => <span className="text-xs">{i.category ?? '—'}</span> },
                { header: 'Description', cell: (i: R) => <span className="block max-w-72 text-sm whitespace-pre-line">{i.description || '—'}</span> },
                { header: 'Qty', align: 'right', cell: (i: R) => <span className="font-mono text-xs">{i.quantity ?? '—'}</span> },
                { header: 'Unit price', align: 'right', cell: (i: R) => <span className="font-mono text-xs">{cedis(i.unitPrice)}</span> },
                { header: 'Total', align: 'right', cell: (i: R) => <span className="font-mono text-xs font-semibold">{cedis(i.totalPrice)}</span> },
              ]}
            />
            <p className="text-right text-sm">
              Total: <b className="font-mono">GHS {cedis(total)}</b>
            </p>
            <div>
              <p className="eyebrow mb-2">Trail</p>
              <ol className="relative space-y-3 border-l border-border pl-5">
                {(r.log as Array<R>).map((l) => (
                  <li key={l.id} className="text-sm">
                    <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-white bg-primary" />
                    <b className="text-slate-800">{l.comments || l.itemDescription || 'Update'}</b>
                    <span className="block text-xs text-muted-foreground">{[l.fullName, STAGES[Number(l.stage)], dateTime(l.dateAdded)].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
