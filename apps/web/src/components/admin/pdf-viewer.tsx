// Opens an uploaded PDF in a popup. Files from the legacy staff portal live on
// that server and cannot be shown here.
import { ExternalLink, FileText } from 'lucide-react'
import { Dialog, DialogContent } from '#/components/ui/dialog'

export const isStoredFile = (path: string | null | undefined): path is string => Boolean(path?.startsWith('/api/files/'))

export function PdfViewer({ url, title, onClose }: { url: string | null; title: string; onClose: () => void }) {
  return (
    <Dialog open={Boolean(url)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={title} className="h-[90dvh] max-w-5xl [&>div:last-child]:p-0">
        {url && (
          <div className="flex h-full flex-col">
            <iframe src={url} title={title} className="min-h-0 w-full flex-1 bg-slate-100" />
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1.5 border-t px-4 py-2 text-xs font-semibold text-primary hover:underline">
              <ExternalLink className="size-3.5" /> Open in a new tab
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** A "view document" button that opens the PDF popup, or a note for legacy files. */
export function DocButton({ path, onOpen }: { path: string | null | undefined; onOpen: (url: string) => void }) {
  if (!path) return <span className="text-xs text-muted-foreground">—</span>
  if (!isStoredFile(path)) return <span className="text-xs text-muted-foreground" title={path}>Legacy file</span>
  return (
    <button type="button" onClick={() => onOpen(path)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
      <FileText className="size-3.5" /> View PDF
    </button>
  )
}
