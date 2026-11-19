// Applying for promotion or contract renewal. Senior members give the full
// dossier and list their papers (and can save a draft); senior and junior
// staff, and contract renewals, attach a CV and their papers or letter.
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Loader2, Plus, Save, Send, Trash2 } from 'lucide-react'
import { PROMOTION_KINDS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Option } from '#/lib/api-client'
import { PROMOTION_DETAIL_FIELDS, promotionApplySchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { FileField } from '#/components/admin/file-upload'
import { Field, FormActions, FormSection, errorAt } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { DETAIL_LABELS } from './labels'

type In = z.input<typeof promotionApplySchema>
type R = Record<string, any>

/** Old-portal drafts hold rich text; editing works on plain text. */
const plain = (v: unknown) =>
  String(v ?? '')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export function ApplicationForm({ type, ranks, detailed, draft }: { type: 0 | 1; ranks: Array<Option>; detailed: boolean; draft?: R }) {
  const navigate = useNavigate()
  const full = detailed && type === 0
  const [error, setError] = useState<string | null>(null)
  const d = (draft?.details ?? {}) as R
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<In>({
    resolver: zodResolver(promotionApplySchema),
    defaultValues: {
      type,
      positionId: (draft?.positionId ?? '') as never,
      kind: (draft?.promoComments ?? (type === 0 ? '' : null)) as never,
      appLetter: draft?.appLetter ?? d.appLetter ?? '',
      appCv: draft?.promoDoc1 ?? d.appCv ?? '',
      papersFile: draft?.promoDoc2 || d.papers || '',
      papers: ((draft?.papers ?? []) as Array<R>).map((p) => ({ title: p.title ?? '', link: p.link ?? '', file: p.file ?? '' })),
      details: Object.fromEntries(PROMOTION_DETAIL_FIELDS.map((k) => [k, plain(d[k])])),
      submit: true,
    },
  })
  const papers = useFieldArray({ control, name: 'papers' })
  const save = useSave((v: In) => (draft ? api.put<{ id: number }>(`/portal/promotion/${draft.promotionId}`, v) : api.post<{ id: number }>('/portal/promotion', v)), {
    invalidate: ['portal'],
    success: (r) => (watch('submit') ? 'Application submitted to your head of department' : `Draft saved (#${r.id})`),
    onDone: (r) => navigate({ to: '/portal/promotion/$id', params: { id: String(r.id) } }),
    onError: setError,
  })
  const go = (submit: boolean) => {
    setValue('submit', submit)
    setError(null)
    void handleSubmit((v) => save.mutate({ ...v, submit }))()
  }
  const err = (path: string) => errorAt(errors, path)
  const fileField = (name: 'appLetter' | 'appCv' | 'papersFile', label: string) => (
    <Field label={label} error={err(name)} className="sm:col-span-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FileField accept=".pdf,application/pdf" endpoint="/portal/files" value={{ url: (field.value as string) || null, name: field.value ? label : null }} onChange={(f) => field.onChange(f.url ?? '')} />
        )}
      />
    </Field>
  )

  return (
    <form onSubmit={(e) => (e.preventDefault(), go(true))} noValidate className="rounded-2xl border bg-white p-6 max-md:p-4">
      <FormSection index={1} title="Application" description={type === 1 ? 'The rank your renewed contract is for.' : 'The rank you are applying for and the type of promotion.'}>
        <Field label="Rank applying for" required error={err('positionId')} className={type === 1 ? 'sm:col-span-2' : undefined}>
          <Controller control={control} name="positionId" render={({ field }) => <Combobox options={ranks} value={(field.value as number) || null} onChange={field.onChange} placeholder="Choose the rank…" invalid={Boolean(errors.positionId)} />} />
        </Field>
        {type === 0 && (
          <Field label="Type of promotion" required error={err('kind')}>
            <NativeSelect {...register('kind')}>
              <option value="">Choose…</option>
              {PROMOTION_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.charAt(0) + k.slice(1).toLowerCase()}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}
      </FormSection>

      {full && (
        <FormSection index={2} title="Your dossier" description="As on the University’s promotion form. Fill what applies to you.">
          {PROMOTION_DETAIL_FIELDS.map((k) => {
            const meta = DETAIL_LABELS[k]
            return (
              <Field key={k} label={meta.label} hint={meta.hint} className={meta.short ? undefined : 'sm:col-span-2'}>
                {meta.short ? <Input {...register(`details.${k}` as never)} /> : <Textarea rows={3} {...register(`details.${k}` as never)} />}
              </Field>
            )
          })}
        </FormSection>
      )}

      <FormSection index={full ? 3 : 2} title="Documents" description="PDF files, up to 10 MB each.">
        {(full || type === 1) && fileField('appLetter', type === 1 ? 'Application letter' : 'Application letter / form')}
        {fileField('appCv', 'Curriculum vitae (CV)')}
        {!full && type === 0 && fileField('papersFile', 'Papers (one PDF)')}
        {full && (
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Papers</p>
              <Button type="button" size="sm" variant="outline" onClick={() => papers.append({ title: '', link: '', file: '' })}>
                <Plus /> Add a paper
              </Button>
            </div>
            {err('papers') && <p className="text-xs font-medium text-destructive">{err('papers')}</p>}
            {papers.fields.length === 0 && <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">List each paper with its title, DOI or link, and the PDF.</p>}
            {papers.fields.map((f, i) => (
              <div key={f.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
                <Field label={`Paper ${i + 1} title`} error={err(`papers.${i}.title`)}>
                  <Input {...register(`papers.${i}.title`)} />
                </Field>
                <Field label="DOI or link">
                  <Input {...register(`papers.${i}.link`)} placeholder="10.1000/xyz123" />
                </Field>
                <Button type="button" variant="ghost" size="sm" className="self-end" onClick={() => papers.remove(i)} aria-label={`Remove paper ${i + 1}`}>
                  <Trash2 />
                </Button>
                <div className="sm:col-span-3">
                  <Controller
                    control={control}
                    name={`papers.${i}.file`}
                    render={({ field }) => (
                      <FileField accept=".pdf,application/pdf" endpoint="/portal/files" value={{ url: (field.value as string) || null, name: field.value ? 'Paper PDF' : null }} onChange={(fl) => field.onChange(fl.url ?? '')} />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {error && <p className="mb-4 rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">{error}</p>}
      <FormActions>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        {full && (
          <Button type="button" variant="outline" disabled={save.isPending} onClick={() => go(false)}>
            <Save /> Save draft
          </Button>
        )}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Send />} Submit application
        </Button>
      </FormActions>
    </form>
  )
}
