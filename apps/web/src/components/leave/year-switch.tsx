// Pill switch for the leave year: the current year and the two before it
// (plus any extra years a tab needs, e.g. next year for planning holidays),
// and "All years". `null` means all years.
import { cn } from '@hrms/ui'

export const CURRENT_YEAR = new Date().getFullYear()
export const RECENT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

export function YearSwitch({
  label,
  value,
  onChange,
  extra = [],
}: {
  label: string
  value: number | null
  onChange: (year: number | null) => void
  extra?: Array<number>
}) {
  const years = [...new Set([...extra, ...RECENT_YEARS])].sort((a, b) => b - a)
  return (
    <div className="flex flex-col gap-1">
      <span className="pl-3 text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="no-scrollbar inline-flex h-10 max-w-full items-center gap-1 overflow-x-auto rounded-full border border-input bg-[#fbfbfd] p-1">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            role="radio"
            aria-checked={value === y}
            onClick={() => onChange(y)}
            className={cn(
              'h-full rounded-full px-3.5 font-mono text-xs font-semibold transition-colors',
              value === y ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-accent',
            )}
          >
            {y}
            {y === CURRENT_YEAR && <span className={cn('ml-1 font-sans text-[0.65rem] font-medium', value === y ? 'text-white/70' : 'text-muted-foreground')}>now</span>}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          onClick={() => onChange(null)}
          className={cn(
            'h-full rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors',
            value === null ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-accent',
          )}
        >
          All years
        </button>
      </div>
    </div>
  )
}
