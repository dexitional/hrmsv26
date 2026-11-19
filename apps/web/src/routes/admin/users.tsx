import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Lock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { USER_ROLES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { relative } from '#/lib/format'
import { ROLE_LABELS } from '#/lib/labels'
import { userSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { Avatar, EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useUser } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'

export const Route = createFileRoute('/admin/users')({ component: UsersPage })

type Row = Record<string, any> & { id: number }
type In = z.input<typeof userSchema>

const ROLE_HINTS: Record<string, string> = {
  administrator: 'Everything, including user accounts',
  hr_officer: 'Runs every HR module; no account administration',
  it_support: 'Accounts and activity log; can correct HR data but not delete',
  viewer: 'Read-only access to every HR module',
}

function UsersPage() {
  const me = useUser()
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['users', { q, role }],
    queryFn: () => api.get<Array<Row>>('/users', { q, role }),
  })
  const remove = useSave((id: number) => api.delete(`/users/${id}`), { invalidate: ['users'], success: 'Account deleted' })
  return (
    <>
      {dialog}
      <UserDialog open={open} onOpenChange={setOpen} user={editing} />
      <PageHeader
        title="User accounts"
        description="HR officers and IT support who can sign in, by password or with their Google account."
        actions={
          <Button onClick={() => (setEditing(null), setOpen(true))}>
            <Plus /> New account
          </Button>
        }
      />
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search name or email…" />
        <FilterSelect
          label="Role"
          value={role}
          onChange={setRole}
          options={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
        />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data}
        empty={<EmptyState icon={ShieldCheck} title="No accounts found" />}
        columns={[
          {
            header: 'User',
            cell: (u) => (
              <span className="flex items-center gap-3">
                <Avatar name={u.fullName} photoUrl={u.avatarUrl} staffNo={u.staffNo} />
                <span>
                  <span className="block font-semibold text-slate-800">
                    {u.fullName} {u.id === me.id && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </span>
              </span>
            ),
          },
          {
            header: 'Role',
            cell: (u) => (
              <Badge tone={u.role === 'administrator' ? 'danger' : u.role === 'viewer' ? 'neutral' : 'brand'} dot={false}>
                {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}
              </Badge>
            ),
          },
          {
            header: 'Sign-in',
            cell: (u) => (
              <span className="flex flex-wrap gap-1">
                {Boolean(u.hasPassword) && <Badge dot={false}>Password</Badge>}
                <Badge tone={u.googleLinked ? 'info' : 'neutral'} dot={false}>
                  {u.googleLinked ? 'Google linked' : 'Google (on first use)'}
                </Badge>
              </span>
            ),
          },
          {
            header: 'Status',
            cell: (u) =>
              u.locked ? (
                <Badge tone="warning">
                  <Lock className="size-3" /> Locked
                </Badge>
              ) : u.isActive ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge>Disabled</Badge>
              ),
          },
          {
            header: 'Last sign-in',
            cell: (u) => <span className="text-xs text-muted-foreground">{u.lastLoginAt ? relative(u.lastLoginAt) : 'Never'}</span>,
          },
          {
            header: '',
            align: 'right',
            cell: (u) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, onSelect: () => (setEditing(u), setOpen(true)) },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: u.id === me.id,
                    onSelect: () =>
                      confirm({
                        title: `Delete ${u.fullName}’s account?`,
                        description: 'They will no longer be able to sign in. Their activity log is kept.',
                        danger: true,
                        confirmLabel: 'Delete account',
                        onConfirm: () => remove.mutateAsync(u.id),
                      }),
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

function UserDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (o: boolean) => void; user: Row | null }) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<In>({ resolver: zodResolver(userSchema) })
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form
  useEffect(() => {
    if (!open) return
    setError(null)
    reset({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'hr_officer',
      staffNo: user?.staffNo ?? '',
      isActive: user ? Boolean(user.isActive) : true,
      password: '',
    })
  }, [open, user, reset])
  const save = useSave((v: In) => (user ? api.put(`/users/${user.id}`, v) : api.post('/users', v)), {
    invalidate: ['users'],
    success: user ? 'Account updated' : 'Account created',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? 'Edit account' : 'New account'}
      description="Google sign-in works for any account email that is a Google (UCC) account."
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
    >
      <Field label="Full name" required error={errors.fullName?.message} className="sm:col-span-2">
        <Input {...register('fullName')} />
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        <Input type="email" {...register('email')} placeholder="name@ucc.edu.gh" />
      </Field>
      <Field label="Role" required hint={ROLE_HINTS[watch('role') ?? '']}>
        <NativeSelect {...register('role')}>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Staff number" hint="Optional: links the account to a staff record" error={errors.staffNo?.message}>
        <Controller
          control={control}
          name="staffNo"
          render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />}
        />
      </Field>
      <Field
        label={user ? 'Reset password' : 'Password'}
        hint={user ? 'Leave blank to keep the current password' : 'Optional: without one, the user signs in with Google'}
        error={errors.password?.message}
      >
        <Input type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
        />
        <span className="text-sm font-medium">Account is active</span>
      </label>
    </FormDialog>
  )
}
