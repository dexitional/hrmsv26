// A small rich-text (WYSIWYG) editor with no extra dependency: bold, italic,
// underline, bulleted and numbered lists, and clearing formatting. Text pasted
// from Word or a web page keeps its formatting (tables and lists included),
// minus styles and scripts; the server cleans the HTML again before saving.
import { useEffect, useRef } from 'react'
import { Bold, Eraser, Italic, List, ListOrdered, Underline } from 'lucide-react'
import { cn } from '@hrms/ui'

const TOOLS = [
  { cmd: 'bold', icon: Bold, label: 'Bold (Ctrl+B)' },
  { cmd: 'italic', icon: Italic, label: 'Italic (Ctrl+I)' },
  { cmd: 'underline', icon: Underline, label: 'Underline (Ctrl+U)' },
  { cmd: 'insertUnorderedList', icon: List, label: 'Bulleted list' },
  { cmd: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
  { cmd: 'removeFormat', icon: Eraser, label: 'Clear formatting' },
] as const

const ALLOWED = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'SUP', 'SUB', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'SPAN', 'DIV', 'A'])

/** Pasted HTML: keep structure and emphasis, drop styles, classes, comments and anything active. */
function cleanPaste(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        continue
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue
      const el = child as HTMLElement
      if (['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'XML', 'O:P'].includes(el.tagName)) {
        el.remove()
        continue
      }
      walk(el)
      if (!ALLOWED.has(el.tagName)) {
        el.replaceWith(...el.childNodes)
        continue
      }
      for (const attr of [...el.attributes]) {
        const keep = (el.tagName === 'A' && attr.name === 'href' && /^(https?:|mailto:)/i.test(attr.value)) || (['TD', 'TH'].includes(el.tagName) && ['colspan', 'rowspan'].includes(attr.name))
        if (!keep) el.removeAttribute(attr.name)
      }
    }
  }
  walk(doc.body)
  return doc.body.innerHTML
}

/** Plain text that was typed before (old drafts) shows with its line breaks. */
function toHtml(value: string) {
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 140,
  invalid,
  id,
}: {
  value: string | null | undefined
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  invalid?: boolean
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Only write into the editor when the value changes from outside (loading a
  // draft), never while typing, or the caret would jump.
  const last = useRef<string | null>(null)
  useEffect(() => {
    const v = value ?? ''
    if (ref.current && v !== last.current) {
      ref.current.innerHTML = toHtml(v)
      last.current = v
    }
  }, [value])

  const emit = () => {
    const el = ref.current
    if (!el) return
    const empty = !el.textContent?.trim() && !el.querySelector('li, table')
    const html = empty ? '' : el.innerHTML
    last.current = html
    onChange(html)
  }
  const run = (cmd: string) => {
    ref.current?.focus()
    document.execCommand(cmd)
    emit()
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15', invalid && 'border-destructive')}>
      <div className="flex flex-wrap gap-0.5 border-b bg-slate-50/80 px-1.5 py-1" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.label}
            aria-label={t.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(t.cmd)}
            className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-primary"
          >
            <t.icon className="size-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        id={id}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          const html = e.clipboardData.getData('text/html')
          if (!html) return
          e.preventDefault()
          document.execCommand('insertHTML', false, cleanPaste(html))
          emit()
        }}
        style={{ minHeight }}
        className="rich-text max-w-none px-3.5 py-2.5 text-sm text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  )
}
