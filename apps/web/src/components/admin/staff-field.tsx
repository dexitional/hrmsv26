// A staff-number input that looks the person up as you type and shows who it
// is (name, designation, unit), with name search as a fallback.
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Search, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { Popover, PopoverAnchor, PopoverContent } from '#/components/ui/popover'
import { Avatar } from './page'
import type { StaffBrief } from './lookups'

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function useStaffBrief(staffNo: number | string | null | undefined) {
  const no = Number(staffNo)
  return useQuery({
    queryKey: ['staff-brief', no],
    queryFn: () => api.get<StaffBrief>(`/lookups/staff/${no}`),
    enabled: Number.isInteger(no) && no > 0,
    retry: false,
    staleTime: 60_000,
  })
}

export function StaffField({
  value,
  onChange,
  onResolved,
  invalid,
  disabled,
  placeholder = 'Staff number or name',
}: {
  value: number | string | null | undefined
  onChange: (value: number | null) => void
  onResolved?: (staff: StaffBrief | null) => void
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const [text, setText] = useState(value ? String(value) : '')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (String(value ?? '') !== text && /^\d*$/.test(text)) setText(value ? String(value) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  const debounced = useDebounced(text.trim())
  const isNumber = /^\d+$/.test(debounced)
  const brief = useStaffBrief(isNumber ? debounced : null)
  const search = useQuery({
    queryKey: ['staff-search', debounced],
    queryFn: () => api.get<Array<StaffBrief>>('/lookups/staff', { q: debounced }),
    enabled: debounced.length >= 2 && !isNumber,
    staleTime: 30_000,
  })
  useEffect(() => {
    if (isNumber) onResolved?.(brief.data ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.data, isNumber])

  return (
    <div className="space-y-1.5">
      <Popover open={open && !isNumber && (search.data?.length ?? 0) > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
            <input
              value={text}
              disabled={disabled}
              aria-invalid={invalid}
              placeholder={placeholder}
              onChange={(e) => {
                const v = e.target.value
                setText(v)
                setOpen(true)
                onChange(/^\d+$/.test(v.trim()) ? Number(v.trim()) : null)
              }}
              className="field-control h-10 pl-9 font-mono placeholder:font-sans"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-72 overflow-y-auto">
          {search.data?.map((s) => (
            <button
              key={s.staffNo}
              type="button"
              onClick={() => {
                setText(String(s.staffNo))
                onChange(s.staffNo)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
            >
              <Avatar name={s.fullName} staffNo={s.staffNo} className="size-7" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{s.fullName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {s.staffNo} · {s.jobTitle ?? '—'}
                </span>
              </span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {isNumber && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs',
            brief.isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-border bg-slate-50 text-slate-600',
          )}
        >
          {brief.isLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Looking up…
            </>
          ) : brief.data ? (
            <>
              <CheckCircle2 className="size-3.5 text-success" />
              <span className="truncate">
                <b className="text-slate-800">{brief.data.fullName}</b> · {brief.data.jobTitle ?? 'No designation'} ·{' '}
                {brief.data.unitName ?? 'No unit'}
              </span>
            </>
          ) : brief.isError ? (
            <>
              <XCircle className="size-3.5" /> No staff member has this number.
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
