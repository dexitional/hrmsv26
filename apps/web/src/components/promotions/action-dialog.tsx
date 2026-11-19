// The HR actions on a promotion/appointment application: move forward,
// return, assign assessors, disapprove, or approve and effect.
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PROMOTION_LEVELS, STAFF_GROUPS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { today } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { effectPromotionSchema } from '#/lib/schemas'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Combobox, MultiCombobox } from '#/components/admin/combobox'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useScales } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'

type R = Record<string, any>
export type Action = 'advance' | 'return' | 'assessors' | 'disapprove' | 'effect'

export function ActionDialog({ app, action, onClose }: { app: R; action: Action | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const steps = useQuery({
    queryKey: ['promotion-steps'],
    queryFn: () => api.get<Array<{ id: string; label: string }>>('/promotions/steps'),
  })
  const assessors = useQuery({
    queryKey: ['assessors'],
    queryFn: () => api.get<Array<R>>('/promotions/assessors'),
    enabled: action === 'assessors',
  })
  const scales = useScales()
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<R>({
    resolver: action === 'effect' ? (zodResolver(effectPromotionSchema) as any) : undefined,
  })
  useEffect(() => {
    if (!action) return
    setError(null)
    reset({
      level: Math.min(7, Math.max(4, Number(app.promoStatus) + 1)),
      hrStep: '',
      comments: '',
      to: 'applicant',
      assessors: app.assessorIds ?? [],
      appointDate: today(),
      letterDate: '',
      scaleId: app.staff?.scaleId ?? '',
      staffGroup: app.staff?.staffGroup ?? 'SM',
    })
  }, [action, app, reset])
  const save = useSave(
    (v: R) =>
      action === 'effect'
        ? api.post(`/promotions/applications/${app.id}/effect`, v)
        : api.post(`/promotions/applications/${app.id}/action`, {
            action,
            ...(action === 'advance' && { level: Number(v.level), hrStep: v.hrStep || null, comments: v.comments }),
            ...(action === 'return' && { to: v.to, comments: v.comments }),
            ...(action === 'assessors' && { assessors: v.assessors, comments: v.comments }),
            ...(action === 'disapprove' && { comments: v.comments }),
          }),
    {
      invalidate: ['promotion', 'promotions', 'staff', 'elevation'],
      success: action === 'effect' ? 'Approved — the elevation record was created' : 'Application updated',
      onDone: onClose,
      onError: setError,
    },
  )
  const titles: Record<Action, string> = {
    advance: 'Move application forward',
    return: 'Return for correction',
    assessors: 'Assign assessors',
    disapprove: 'Disapprove application',
    effect: 'Approve and effect',
  }
  const level = Number(watch('level'))
  return (
    <FormDialog
      wide={action === 'advance' || action === 'effect'}
      open={Boolean(action)}
      onOpenChange={(o) => !o && onClose()}
      title={action ? titles[action] : ''}
      description={
        action === 'effect'
          ? `Creates a ${app.type === 2 ? 'appointment' : 'promotion'} to ${app.positionTitle} for ${app.fullName}, makes it current and approves the application.`
          : undefined
      }
      onSubmit={handleSubmit((v) => save.mutate(v))}
      busy={save.isPending}
      error={error}
      submitLabel={action === 'effect' ? 'Approve & effect' : action === 'disapprove' ? 'Disapprove' : 'Save'}
    >
      {action === 'advance' && (
        <>
          <Field label="Move to">
            <NativeSelect {...register('level')}>
              {Object.entries(PROMOTION_LEVELS)
                .filter(([k]) => Number(k) < 8)
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
            </NativeSelect>
          </Field>
          <Field label="HR processing step" hint={level >= 4 ? 'Optional' : 'Used once the application reaches HR'}>
            <NativeSelect {...register('hrStep')} disabled={level < 4}>
              <option value="">—</option>
              {steps.data
                ?.filter((s) => s.id !== '11')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · {s.label.charAt(0) + s.label.slice(1).toLowerCase()}
                  </option>
                ))}
            </NativeSelect>
          </Field>
        </>
      )}
      {action === 'return' && (
        <Field label="Return to" className="sm:col-span-2">
          <NativeSelect {...register('to')}>
            <option value="applicant">The applicant (re-submit CV, papers and form)</option>
            <option value="head">The head of department and applicant</option>
          </NativeSelect>
        </Field>
      )}
      {action === 'assessors' && (
        <Field label="Assessors (up to 6)" className="sm:col-span-2">
          <Controller
            control={control}
            name="assessors"
            render={({ field }) => (
              <MultiCombobox
                options={assessors.data
                  ?.filter((x) => x.active || (field.value ?? []).includes(x.assessorId))
                  .map((x) => ({
                    value: x.assessorId,
                    label: `${x.fname} ${x.lname}`,
                    hint: [x.eduLevel, x.institution].filter(Boolean).join(' · '),
                  }))}
                loading={assessors.isLoading}
                value={field.value ?? []}
                onChange={(v) => field.onChange(v.slice(0, 6))}
                placeholder="Choose assessors…"
              />
            )}
          />
        </Field>
      )}
      {action === 'effect' ? (
        <>
          <Field label="Effective date" required error={errors.appointDate?.message as string}>
            <Input type="date" {...register('appointDate')} />
          </Field>
          <Field label="Letter date">
            <Input type="date" {...register('letterDate')} />
          </Field>
          <Field label="Staff category" required>
            <NativeSelect {...register('staffGroup')}>
              {STAFF_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {GROUP_LABELS[g]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Grade / scale">
            <Controller
              control={control}
              name="scaleId"
              render={({ field }) => (
                <Combobox
                  options={scales.data}
                  loading={scales.isLoading}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Choose grade and notch…"
                />
              )}
            />
          </Field>
        </>
      ) : (
        <Field label="Comments" required={action === 'return' || action === 'disapprove'} className="sm:col-span-2">
          <Textarea rows={4} {...register('comments')} />
        </Field>
      )}
    </FormDialog>
  )
}
