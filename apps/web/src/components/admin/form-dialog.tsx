// A dialog holding a form: title, fields, and Cancel / Save in a footer.
import { Loader2 } from 'lucide-react'
import { cn } from '@hrms/ui'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  busy,
  submitLabel = 'Save',
  wide,
  children,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  busy?: boolean
  submitLabel?: string
  wide?: boolean
  children: React.ReactNode
  error?: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent title={title} description={description} className={cn(wide ? 'max-w-3xl' : 'max-w-xl')}>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">{children}</div>
          {error && (
            <p role="alert" className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">
              {error}
            </p>
          )}
          <div className="-mx-6 -mb-5 flex justify-end gap-2 border-t bg-slate-50/60 px-6 py-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
