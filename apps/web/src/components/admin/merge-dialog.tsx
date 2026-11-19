// Prompts for the ID of the master record another record is merged into,
// shows what that ID refers to, and asks for confirmation.
import { useEffect, useState } from 'react'
import { GitMerge } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Field } from './form'
import { FormDialog } from './form-dialog'

export function MergeDialog({
  open,
  onOpenChange,
  source,
  noun,
  candidates,
  onMerge,
  busy,
  error,
  consequences,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  source: { id: number; name: string } | null
  noun: string
  candidates: Array<{ id: number; name: string; active?: boolean }>
  onMerge: (masterId: number) => void
  busy?: boolean
  error?: string | null
  consequences: string
}) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (open) (setValue(''), setTouched(false))
  }, [open])
  const id = Number(value)
  const master = candidates.find((c) => c.id === id)
  const problem = !value
    ? `Enter the ID of the master ${noun}`
    : id === source?.id
      ? `A ${noun} cannot be merged into itself`
      : !master
        ? `There is no ${noun} with ID ${value}`
        : master.active === false
          ? `That ${noun} is inactive`
          : null
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Merge ${noun}`}
      description={source ? `Merge “${source.name}” (ID ${source.id}) into another ${noun}.` : undefined}
      submitLabel="Merge"
      busy={busy}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!problem) onMerge(id)
      }}
    >
      <Field label={`Master ${noun} ID`} required error={touched ? (problem ?? undefined) : undefined} className="sm:col-span-2">
        <Input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))} autoFocus className="font-mono" placeholder="e.g. 5075" />
      </Field>
      {master && !problem && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft p-3 text-sm sm:col-span-2">
          <GitMerge className="mt-0.5 size-4 text-primary" />
          <p>
            <b>{source?.name}</b> will be merged into <b>{master.name}</b>. {consequences}
          </p>
        </div>
      )}
    </FormDialog>
  )
}
