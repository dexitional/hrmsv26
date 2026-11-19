// A4 printouts on the Directorate of Human Resource letterhead.
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Printer } from 'lucide-react'
import { cn } from '@hrms/ui'

export function PrintPage({
  title,
  subtitle,
  loading,
  error,
  landscape,
  children,
}: {
  title: string
  subtitle?: React.ReactNode
  loading?: boolean
  error?: string | null
  landscape?: boolean
  children?: React.ReactNode
}) {
  // On screens narrower than the A4 sheet, shrink the preview to fit
  // (printing always uses the real size; see .print-sheet in styles.css).
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const sheetPx = (landscape ? 297 : 210) * (96 / 25.4) // A4 width in CSS pixels
    const fit = () => setZoom(Math.min(1, (window.innerWidth - 24) / sheetPx))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [landscape])
  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-200/70 pb-16 print:bg-white print:pb-0">
      {landscape && <style>{'@page { size: A4 landscape; margin: 0; }'}</style>}
      <div className="no-print sticky top-0 z-10 mb-6 flex items-center justify-between gap-3 border-b bg-white/90 px-6 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => (history.length > 1 ? history.back() : window.close())}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <p className="hidden min-w-0 truncate text-sm font-semibold text-slate-700 sm:block">{title}</p>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={loading || Boolean(error)}
          className="btn-shine inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Printer className="size-4" /> Print / Save PDF
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <p className="font-semibold">This document is not available.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Link to="/admin" className="mt-4 inline-block text-sm text-primary underline">
            Back to the dashboard
          </Link>
        </div>
      ) : (
        <article style={{ zoom }} className={cn('print-sheet shadow-xl', landscape && 'print-landscape')}>
          <header className="flex items-center gap-4 border-b-[3px] border-double border-black pb-3">
            <img src="/ucc-logo.png" alt="University of Cape Coast" className="h-[20mm] w-auto" />
            <div className="flex-1">
              <p className="text-[14pt] font-bold tracking-wide">UNIVERSITY OF CAPE COAST</p>
              <p className="text-[11pt] font-bold">DIRECTORATE OF HUMAN RESOURCE</p>
              <p className="text-[8.5pt] text-slate-600">Private Mail Bag, University Post Office, Cape Coast, Ghana</p>
            </div>
          </header>
          <div className="mt-4 mb-4 text-center">
            <h1 className="text-[13pt] leading-tight font-bold uppercase">{title}</h1>
            {subtitle && <p className="mt-0.5 text-[10pt] italic">{subtitle}</p>}
          </div>
          {children}
          <p className="mt-8 border-t border-dashed border-slate-400 pt-2 text-center font-sans text-[7.5pt] text-slate-500">
            Generated from the UCC HRMS on{' '}
            {new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </article>
      )}
    </div>
  )
}

/** A bordered table for printouts. */
export function PrintTable({
  head,
  rows,
  empty = 'No records.',
  className,
}: {
  head: Array<React.ReactNode>
  rows: Array<Array<React.ReactNode>>
  empty?: string
  className?: string
}) {
  return (
    <table className={cn('text-[9.5pt]', className)}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} className="cell bg-[#ededed] text-left font-bold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className="cell text-center italic" colSpan={head.length}>
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i} className="print-avoid-break">
              {r.map((c, j) => (
                <td key={j} className="cell">
                  {c ?? '—'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

/** Staff particulars block at the top of a personal printout. */
export function PrintParticulars({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <table className="mb-4 text-[10pt]">
      <tbody>
        {Array.from({ length: Math.ceil(items.length / 2) }).map((_, r) => (
          <tr key={r}>
            {items.slice(r * 2, r * 2 + 2).map(([label, value]) => (
              <td key={label} className="cell w-1/2">
                <span className="font-bold">{label}:</span> <span className="font-sans text-[9.5pt]">{value ?? '—'}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function PrintSection({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-5 mb-2 text-[11pt] font-bold uppercase">{children}</h2>
}
