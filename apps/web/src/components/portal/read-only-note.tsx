import { Info } from 'lucide-react'

/** Says plainly that an action still happens elsewhere for now. */
export function ReadOnlyNote({ what }: { what: string }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-xl bg-primary-soft/60 px-4 py-3 text-sm text-slate-700">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>
        This list shows where each of your staff’s files is. {what} in the new portal is coming next; until then it continues as before.
      </span>
    </p>
  )
}
