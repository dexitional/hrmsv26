import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import { ROLE_LABELS } from '#/lib/labels'
import { changePasswordSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Field } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { DetailList, PageHeader } from '#/components/admin/page'
import { useUser } from '#/components/admin/session'

export const Route = createFileRoute('/admin/account')({ component: AccountPage })

type Values = z.input<typeof changePasswordSchema>

function AccountPage() {
  const user = useUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(changePasswordSchema) })
  const save = useSave((v: Values) => api.post('/auth/password', v), {
    invalidate: ['session'],
    success: user.hasPassword ? 'Password changed' : 'Password set',
    onDone: () => reset({ currentPassword: '', newPassword: '', confirmPassword: '' }),
  })
  return (
    <>
      <PageHeader title="My account" description="Your sign-in details." />
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <CardBody>
            <DetailList
              columns={1}
              items={[
                ['Name', user.fullName],
                ['Email', user.email],
                ['Role', ROLE_LABELS[user.role]],
                ['Staff number', user.staffNo],
                ['Sign-in', user.hasPassword ? 'Password and Google' : 'Google only'],
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title={user.hasPassword ? 'Change password' : 'Set a password'}
            description={user.hasPassword ? undefined : 'You sign in with Google. A password lets you sign in without it.'}
          />
          <CardBody>
            <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
              {user.hasPassword && (
                <Field label="Current password" error={errors.currentPassword?.message}>
                  <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
                </Field>
              )}
              <Field label="New password" error={errors.newPassword?.message}>
                <Input type="password" autoComplete="new-password" {...register('newPassword')} />
              </Field>
              <Field label="Confirm new password" error={errors.confirmPassword?.message}>
                <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
              </Field>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="animate-spin" /> : <KeyRound />} Save password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
