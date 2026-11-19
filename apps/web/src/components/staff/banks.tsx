import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Landmark, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { bankSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'

type Row = Record<string, any> & { id: number }
type In = z.input<typeof bankSchema>

const GHANA_BANKS = ['GCB BANK PLC', 'ABSA BANK GHANA', 'ACCESS BANK GHANA', 'ADB BANK', 'CAL BANK', 'CONSOLIDATED BANK GHANA', 'ECOBANK GHANA', 'FIDELITY BANK GHANA', 'FIRST ATLANTIC BANK', 'FIRST NATIONAL BANK GHANA', 'GTBANK GHANA', 'NATIONAL INVESTMENT BANK', 'OMNIBSIC BANK', 'PRUDENTIAL BANK', 'REPUBLIC BANK GHANA', 'SOCIETE GENERALE GHANA', 'STANBIC BANK GHANA', 'STANDARD CHARTERED BANK GHANA', 'UNITED BANK FOR AFRICA', 'UNIVERSAL MERCHANT BANK', 'ZENITH BANK GHANA']

export function BanksTab({ staffNo }: { staffNo: string }) {
  const canEdit = useCan('staff', 'edit')
  const canManage = useCan('staff', 'manage')
  const { confirm, dialog } = useConfirm()
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['banks', staffNo], queryFn: () => api.get<Array<Row>>(`/staff-records/${staffNo}/banks`) })
  const makeDefault = useSave((id: number) => api.post(`/staff-records/banks/${id}/default`), { invalidate: ['banks'], success: 'Salary account updated' })
  const remove = useSave((id: number) => api.delete(`/staff-records/banks/${id}`), { invalidate: ['banks'], success: 'Account removed' })
  return (
    <>
      {dialog}
      <BankDialog staffNo={staffNo} value={form} onClose={() => setForm(null)} />
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="text-sm text-muted-foreground">Bank accounts on file. Salary is paid into the default account.</p>
        {canEdit && (
          <Button onClick={() => setForm({ row: null })}>
            <Plus /> Add account
          </Button>
        )}
      </div>
      <DataTable
        className="rounded-none border-x-0 border-b-0"
        loading={isLoading}
        rows={data}
        empty={<EmptyState icon={Landmark} title="No bank accounts recorded" />}
        columns={[
          { header: 'Bank', cell: (r) => <span className="font-semibold text-slate-800">{r.bankName}</span> },
          { header: 'Account number', cell: (r) => <span className="font-mono text-sm tracking-wide">{r.accountNo}</span> },
          { header: 'Account name', cell: (r) => r.accountName || '—' },
          { header: 'Branch', cell: (r) => r.accountBranch || '—' },
          { header: 'Date added', cell: (r) => <span className="text-xs">{date(r.dateAdded)}</span> },
          { header: 'Salary account', cell: (r) => (r.isDefault ? <Badge tone="success"><Star className="size-3" /> Default</Badge> : <span className="text-xs text-muted-foreground">No</span>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Make default', icon: Star, hidden: !canEdit || Boolean(r.isDefault), onSelect: () => makeDefault.mutate(r.id) },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete the ${r.bankName} account?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function BankDialog({ staffNo, value, onClose }: { staffNo: string; value: { row: Row | null } | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(bankSchema) })
  const row = value?.row ?? null
  useEffect(() => {
    if (value) (setError(null), reset({ bankName: row?.bankName ?? '', accountNo: row?.accountNo ?? '', accountName: row?.accountName ?? '', accountBranch: row?.accountBranch ?? '', isDefault: row ? Boolean(row.isDefault) : false }))
  }, [value, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/staff-records/banks/${row.id}`, v) : api.post(`/staff-records/${staffNo}/banks`, v)), {
    invalidate: ['banks'],
    success: 'Bank account saved',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={row ? 'Edit bank account' : 'Add bank account'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Bank name" required error={errors.bankName?.message} className="sm:col-span-2">
        <Input list="ghana-banks" {...register('bankName')} className="uppercase" />
        <datalist id="ghana-banks">
          {GHANA_BANKS.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </Field>
      <Field label="Account number" required error={errors.accountNo?.message}>
        <Input {...register('accountNo')} className="font-mono" />
      </Field>
      <Field label="Bank branch">
        <Input {...register('accountBranch')} />
      </Field>
      <Field label="Account name" className="sm:col-span-2">
        <Input {...register('accountName')} />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="isDefault" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Default salary account</span>
      </label>
    </FormDialog>
  )
}
