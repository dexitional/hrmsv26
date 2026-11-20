// Applying for promotion or contract renewal. Senior members fill the
// University's senior members' promotion form (particulars, a rich-text
// dossier, signed declaration, papers): it saves itself as a draft as they
// work, and they can preview it, formatted, before saving or submitting.
// Senior and junior staff attach a CV and their papers. Contract renewal is
// for senior members.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { AlertTriangle, CheckCircle2, CloudUpload, Eye, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react'
import { PROMOTION_KINDS } from '@hrms/db/types'
import { api, errorMessage } from '#/lib/api-client'
import type { Option } from '#/lib/api-client'
import { PROMOTION_DETAIL_FIELDS, promotionApplySchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Input, NativeSelect } from '#/components/ui/input'
import { Combobox } from '#/components/admin/combobox'
import { FileField } from '#/components/admin/file-upload'
import { Field, FormActions, FormSection, errorAt } from '#/components/admin/form'
import { RichTextEditor } from '#/components/ui/rich-text-editor'
import { useSave } from '#/components/admin/mutations'
import { DETAIL_LABELS, dossierSections } from './labels'

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

/** The dossier answers, edited as rich text (as the old portal's editor stored them). */
const RICH_FIELDS = new Set<string>(dossierSections(true).map((x) => x.key))

type Particulars = { dept: string | null; college: string | null; email: string | null; tel: string | null; presentRank: string | null; prEdate: string | null; academic: boolean }

export function ApplicationForm({
  type,
  ranks,
  detailed,
  draft,
  particulars,
  applicant,
}: {
  type: 0 | 1
  ranks: Array<Option>
  detailed: boolean
  draft?: R
  /** Senior members: their department, college, contacts and present rank, as the form shows them. */
  particulars?: Particulars | null
  applicant: { fullName: string; staffNo: number }
}) {
  const navigate = useNavigate()
  const full = detailed && type === 0
  const [error, setError] = useState<string | null>(null)
  const d = (draft?.details ?? {}) as R
  const { register, control, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<In>({
    resolver: zodResolver(promotionApplySchema),
    defaultValues: {
      type,
      positionId: (draft?.positionId ?? '') as never,
      kind: (draft?.promoComments ?? (type === 0 ? '' : null)) as never,
      appLetter: draft?.appLetter ?? d.appLetter ?? '',
      appCv: draft?.promoDoc1 ?? d.appCv ?? '',
      papersFile: draft?.promoDoc2 || d.papers || '',
      papers: ((draft?.papers ?? []) as Array<R>).map((p) => ({ title: p.title ?? '', link: p.link ?? '', file: p.file ?? '' })),
      details: {
        // Dossier answers keep their formatting (rich text); the short particulars are plain.
        ...Object.fromEntries(PROMOTION_DETAIL_FIELDS.map((k) => [k, RICH_FIELDS.has(k) ? String(d[k] ?? '') : plain(d[k])])),
        // Present rank and its date come from the record unless the draft has them.
        presentRank: plain(d.presentRank) || particulars?.presentRank || '',
        prEdate: String(d.prEdate ?? '').slice(0, 10) || particulars?.prEdate || '',
      },
      signature: d.signature ?? '',
      subDate: String(d.subDate ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10),
      submit: true,
    },
  })
  const papers = useFieldArray({ control, name: 'papers' })
  // The draft this form writes to: the one opened, or the one autosave creates.
  const draftId = useRef<number | null>(draft?.promotionId ? Number(draft.promotionId) : null)
  const send = (v: In) => (draftId.current ? api.put<{ id: number }>(`/portal/promotion/${draftId.current}`, v) : api.post<{ id: number }>('/portal/promotion', v))
  const save = useSave(send, {
    invalidate: ['portal'],
    success: (r) => (watch('submit') ? 'Application submitted to your head of department' : `Draft saved (#${r.id})`),
    onDone: (r) => navigate({ to: '/portal/promotion/$id', params: { id: String(r.id) } }),
    onError: setError,
  })
  const auto = useAutosave(full, getValues, watch, (v) => send(v), (id) => {
    if (draftId.current) return
    draftId.current = id
    // Remember the draft in the address bar, without reloading the form.
    const url = new URL(window.location.href)
    url.searchParams.set('draft', String(id))
    window.history.replaceState(window.history.state, '', url)
  })
  const [previewing, setPreviewing] = useState(false)
  const go = (submit: boolean) => {
    auto.cancel()
    setPreviewing(false)
    setValue('submit', submit)
    setError(null)
    void handleSubmit((v) => save.mutate({ ...v, submit }))()
  }
  const err = (path: string) => errorAt(errors, path)
  const fileField = (name: 'appLetter' | 'appCv' | 'papersFile' | 'signature', label: string, accept = '.pdf,application/pdf', hint?: string) => (
    <Field label={label} error={err(name)} hint={hint} className="sm:col-span-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FileField accept={accept} endpoint="/portal/files" value={{ url: (field.value as string) || null, name: field.value ? label : null }} onChange={(f) => field.onChange(f.url ?? '')} />
        )}
      />
    </Field>
  )
  const readOnly = (label: string, value: string | null | undefined, wide = false) => (
    <Field label={label} className={wide ? 'sm:col-span-2' : undefined}>
      <Input value={value ?? ''} readOnly disabled className="bg-slate-50" />
    </Field>
  )
  const sections = dossierSections(particulars?.academic ?? true)

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
        <>
          <FormSection index={2} title="Applicant’s particulars" description="From your staff record. Ask HR to correct anything here that is wrong.">
            {readOnly('Department', particulars?.dept)}
            {readOnly('College / Directorate', particulars?.college)}
            {readOnly('Email address', particulars?.email)}
            {readOnly('Telephone', particulars?.tel)}
            <Field label={DETAIL_LABELS.areaSpecialization.label} className="sm:col-span-2">
              <Input {...register('details.areaSpecialization' as never)} />
            </Field>
            <Field label={DETAIL_LABELS.presentRank.label}>
              <Input {...register('details.presentRank' as never)} readOnly={Boolean(particulars?.presentRank)} className={particulars?.presentRank ? 'bg-slate-50' : undefined} />
            </Field>
            <Field label={DETAIL_LABELS.prEdate.label}>
              <Input type="date" {...register('details.prEdate' as never)} readOnly={Boolean(particulars?.prEdate)} className={particulars?.prEdate ? 'bg-slate-50' : undefined} />
            </Field>
            <Field label={DETAIL_LABELS.presentRankIfany.label}>
              <Input {...register('details.presentRankIfany' as never)} placeholder="e.g. Head of department" />
            </Field>
            <Field label={DETAIL_LABELS.ppEdate.label}>
              <Input type="date" {...register('details.ppEdate' as never)} />
            </Field>
          </FormSection>

          <FormSection index={3} title="Your dossier" description="As on the University’s promotion form for senior members. Fill what applies to you.">
            {sections.map((meta) => (
              <Field key={meta.key} label={meta.label} hint={meta.hint} className="sm:col-span-2">
                <Controller
                  control={control}
                  name={`details.${meta.key}` as never}
                  render={({ field }) => <RichTextEditor value={field.value as string} onChange={field.onChange} placeholder="Type here, or paste from Word…" />}
                />
              </Field>
            ))}
          </FormSection>

          <FormSection index={4} title="Declaration" description="Your signature as a picture (.png, .jpg or .jpeg) and the date. Needed before you submit; not for a draft.">
            {fileField('signature', 'Signature', '.png,.jpg,.jpeg,image/png,image/jpeg', 'A clear photo or scan of your signature on white paper.')}
            <Field label="Date" error={err('subDate')}>
              <Input type="date" {...register('subDate')} />
            </Field>
            {readOnly('Staff no.', String(applicant.staffNo))}
            {readOnly('Name of applicant (in full)', applicant.fullName, true)}
          </FormSection>
        </>
      )}

      <FormSection index={full ? 5 : 2} title="Documents" description="PDF files, up to 10 MB each.">
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
      {full && (
        <PreviewDialog
          open={previewing}
          onClose={() => setPreviewing(false)}
          values={previewing ? getValues() : null}
          ranks={ranks}
          particulars={particulars}
          applicant={applicant}
          busy={save.isPending}
          onSave={() => go(false)}
          onSubmit={() => go(true)}
        />
      )}
      <FormActions>
        {full && <AutosaveStatus state={auto.state} />}
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        {full && (
          <Button type="button" variant="outline" onClick={() => setPreviewing(true)}>
            <Eye /> Preview
          </Button>
        )}
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

// ---------------------------------------------------------------- Autosave

type AutoState = { kind: 'idle' } | { kind: 'pending' } | { kind: 'saving' } | { kind: 'saved'; at: Date } | { kind: 'waiting'; why: string } | { kind: 'failed'; why: string }

const AUTOSAVE_MS = 10_000

/**
 * Saves the senior members' form as a draft about ten seconds after the last
 * change (once the rank and type of promotion are chosen), and once more when
 * the page is left with changes still unsaved.
 */
function useAutosave(
  enabled: boolean,
  getValues: () => In,
  watch: ReturnType<typeof useForm<In>>['watch'],
  write: (v: In) => Promise<{ id: number }>,
  onCreated: (id: number) => void,
) {
  const [state, setState] = useState<AutoState>({ kind: 'idle' })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)
  const busy = useRef(false)
  const stopped = useRef(false)
  // The latest callbacks, so the save routine itself never changes.
  const latest = useRef({ getValues, write, onCreated })
  latest.current = { getValues, write, onCreated }

  const runRef = useRef(async () => {
    if (stopped.current || !dirty.current) return
    if (busy.current) {
      timer.current = setTimeout(() => void runRef.current(), 2000)
      return
    }
    const v = { ...latest.current.getValues(), submit: false }
    if (!v.positionId || (v.type === 0 && !v.kind)) return setState({ kind: 'waiting', why: 'Autosave starts once you choose the rank and type of promotion.' })
    const parsed = promotionApplySchema.safeParse(v)
    if (!parsed.success) return setState({ kind: 'failed', why: parsed.error.issues[0]?.message ?? 'Check the form' })
    busy.current = true
    dirty.current = false
    setState({ kind: 'saving' })
    try {
      const r = await latest.current.write(v)
      latest.current.onCreated(r.id)
      setState({ kind: 'saved', at: new Date() })
    } catch (err) {
      dirty.current = true
      setState({ kind: 'failed', why: errorMessage(err) })
    } finally {
      busy.current = false
    }
  })
  const run = runRef.current

  useEffect(() => {
    if (!enabled) return
    const sub = watch((_, info) => {
      if (stopped.current || info.name === 'submit') return
      dirty.current = true
      setState((s) => (s.kind === 'pending' ? s : { kind: 'pending' }))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void run(), AUTOSAVE_MS)
    })
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current || busy.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      sub.unsubscribe()
      window.removeEventListener('beforeunload', warn)
      if (timer.current) clearTimeout(timer.current)
      // Leaving the form inside the app: save what was not saved yet.
      if (dirty.current && !stopped.current) void run()
    }
  }, [enabled, watch, run])

  return {
    state,
    /** Saving or submitting by hand takes over from autosave. */
    cancel: () => {
      stopped.current = true
      if (timer.current) clearTimeout(timer.current)
    },
  }
}

function AutosaveStatus({ state }: { state: AutoState }) {
  const time = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const [icon, text, tone] =
    state.kind === 'saving'
      ? [<Loader2 key="i" className="size-3.5 animate-spin" />, 'Saving draft…', 'text-muted-foreground']
      : state.kind === 'saved'
        ? [<CheckCircle2 key="i" className="size-3.5" />, `Draft saved at ${time(state.at)}`, 'text-emerald-700']
        : state.kind === 'pending'
          ? [<CloudUpload key="i" className="size-3.5" />, 'Unsaved changes · saving shortly', 'text-muted-foreground']
          : state.kind === 'waiting'
            ? [<CloudUpload key="i" className="size-3.5" />, state.why, 'text-muted-foreground']
            : state.kind === 'failed'
              ? [<AlertTriangle key="i" className="size-3.5" />, `Not saved: ${state.why}`, 'text-amber-700']
              : [<CloudUpload key="i" className="size-3.5" />, 'Autosave is on', 'text-muted-foreground']
  return (
    <p className={`mr-auto flex min-w-0 items-center gap-1.5 text-xs ${tone}`} role="status" aria-live="polite">
      {icon}
      <span className="truncate">{text}</span>
    </p>
  )
}

// ---------------------------------------------------------------- Preview

function PreviewDialog({
  open,
  onClose,
  values,
  ranks,
  particulars,
  applicant,
  busy,
  onSave,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  values: In | null
  ranks: Array<Option>
  particulars?: Particulars | null
  applicant: { fullName: string; staffNo: number }
  busy: boolean
  onSave: () => void
  onSubmit: () => void
}) {
  if (!values) return null
  const det = (values.details ?? {}) as Record<string, string | null | undefined>
  const rank = ranks.find((r) => Number(r.value) === Number(values.positionId))?.label
  const papers = (values.papers ?? []).filter((p) => p.title || p.file)
  const missing = [
    !values.positionId && 'the rank you are applying for',
    !values.kind && 'the type of promotion',
    !values.signature && 'your signature',
    !values.appCv && 'your CV',
    !papers.length && 'your papers',
  ].filter(Boolean) as Array<string>
  const fmtDate = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <tr className="align-top">
      <th className="w-[38%] border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-700">{label}</th>
      <td className="border border-slate-300 px-3 py-1.5 text-sm text-slate-800">{children || '—'}</td>
    </tr>
  )
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl" title="Preview of your application" description="How your head, dean and HR will read it. Nothing has been sent yet.">
        <article className="space-y-5 font-serif">
          <header className="text-center">
            <p className="text-base font-bold tracking-wide">UNIVERSITY OF CAPE COAST</p>
            <p className="text-sm font-bold underline underline-offset-4">APPLICATION FOR PROMOTION</p>
            <p className="mt-1 text-sm">
              to the rank of <b>{rank ?? '—'}</b> · {values.kind ? String(values.kind).charAt(0) + String(values.kind).slice(1).toLowerCase() : '—'} promotion
            </p>
          </header>

          <section>
            <h3 className="mb-1.5 text-xs font-bold tracking-wide text-slate-700 uppercase">Applicant’s particulars</h3>
            <table className="w-full border-collapse">
              <tbody>
                <Row label="Name of applicant">{applicant.fullName}</Row>
                <Row label="Staff no.">{applicant.staffNo}</Row>
                <Row label="Department">{particulars?.dept}</Row>
                <Row label="College / Directorate">{particulars?.college}</Row>
                <Row label="Email address">{particulars?.email}</Row>
                <Row label="Telephone">{particulars?.tel}</Row>
                <Row label={DETAIL_LABELS.areaSpecialization.label}>{det.areaSpecialization}</Row>
                <Row label="Present rank">
                  {det.presentRank} {det.prEdate ? `(effective ${fmtDate(det.prEdate)})` : ''}
                </Row>
                <Row label="Present position held (if any)">
                  {det.presentRankIfany} {det.ppEdate ? `(effective ${fmtDate(det.ppEdate)})` : ''}
                </Row>
              </tbody>
            </table>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold tracking-wide text-slate-700 uppercase">Dossier</h3>
            {dossierSections(particulars?.academic ?? true).map((s, i) => (
              <div key={s.key}>
                <p className="text-sm font-bold text-slate-900">
                  {i + 1}. {s.label}
                </p>
                {det[s.key] ? (
                  <div
                    className="mt-1 text-sm text-slate-800 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: String(det[s.key]) }}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-400 italic">Not filled</p>
                )}
              </div>
            ))}
          </section>

          <section>
            <h3 className="mb-1.5 text-xs font-bold tracking-wide text-slate-700 uppercase">Declaration and documents</h3>
            <table className="w-full border-collapse">
              <tbody>
                <Row label="Signature">{values.signature ? 'Uploaded' : <span className="text-amber-700">Not uploaded</span>}</Row>
                <Row label="Date">{fmtDate(values.subDate)}</Row>
                <Row label="Application letter / form">{values.appLetter ? 'Uploaded' : 'Not uploaded'}</Row>
                <Row label="Curriculum vitae">{values.appCv ? 'Uploaded' : <span className="text-amber-700">Not uploaded</span>}</Row>
                <Row label={`Papers (${papers.length})`}>
                  {papers.length ? (
                    <ol className="list-decimal pl-5">
                      {papers.map((p, i) => (
                        <li key={i}>
                          {String(p.title || 'Untitled')}
                          {p.link ? <span className="text-slate-500"> · {String(p.link)}</span> : null}
                          {!p.file && <span className="text-amber-700"> · PDF not uploaded</span>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <span className="text-amber-700">None listed</span>
                  )}
                </Row>
              </tbody>
            </table>
          </section>
        </article>

        {missing.length > 0 && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> Before you submit, add {missing.join(', ')}. You can save it as a draft meanwhile.
          </p>
        )}
        <div className="sticky bottom-0 mt-5 flex flex-wrap justify-end gap-2 border-t bg-white pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Back to editing
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={onSave}>
            <Save /> Save draft
          </Button>
          <Button type="button" disabled={busy || missing.length > 0} onClick={onSubmit}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />} Submit application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
