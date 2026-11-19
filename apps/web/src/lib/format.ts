// Dates arrive as "YYYY-MM-DD" (DATE) or "YYYY-MM-DD HH:MM:SS" (TIMESTAMP)
// strings; parse them as local dates so nothing shifts a day. Legacy rows can
// hold '0000-00-00', which is treated as empty.
const isBlank = (v: string | null | undefined): v is null | undefined | '' => !v || v.startsWith('0000')

function parse(value: string) {
  const [d, t] = value.split(/[ T]/)
  const [y, m, day] = (d ?? '').split('-').map(Number)
  const [hh, mm] = (t ?? '00:00').split(':').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, day ?? 1, hh ?? 0, mm ?? 0)
}

export function date(value: string | null | undefined, style: 'medium' | 'long' | 'short' = 'medium') {
  if (isBlank(value)) return '—'
  const d = parse(value)
  if (style === 'short') return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: style === 'long' ? 'long' : 'short', year: 'numeric' })
}

export function dateTime(value: string | null | undefined) {
  if (isBlank(value)) return '—'
  return parse(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relative(value: string | null | undefined) {
  if (isBlank(value)) return '—'
  const diff = (Date.now() - parse(value).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  return date(value)
}

export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** ISO date `years` after `value` (the day before, for an inclusive end date). */
export function addYears(value: string | null | undefined, years: number, inclusiveEnd = false) {
  if (isBlank(value) || !Number.isFinite(years)) return ''
  const d = parse(value)
  d.setFullYear(d.getFullYear() + years)
  if (inclusiveEnd) d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "in 45 days" / "3 days ago" / "today". */
export function daysPhrase(days: number | null | undefined) {
  if (days === null || days === undefined) return '—'
  const n = Number(days)
  if (n === 0) return 'today'
  const abs = Math.abs(n)
  const span =
    abs >= 730 ? `${Math.floor(abs / 365)} years` : abs >= 60 ? `${Math.round(abs / 30.4)} months` : `${abs} day${abs === 1 ? '' : 's'}`
  return n > 0 ? `in ${span}` : `${span} ago`
}

export function num(value: number | string | null | undefined, digits = 0) {
  return Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: digits })
}

export function money(value: number | string | null | undefined) {
  return `GHS ${Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function percent(part: number, whole: number) {
  if (!whole) return 0
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)))
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const genderLabel = (g: string | null | undefined) => (g === 'M' ? 'Male' : g === 'F' ? 'Female' : '—')

/** Every country, named from the runtime's ICU data. */
let countryCache: Array<string> | null = null
export function countries() {
  if (countryCache) return countryCache
  const skip = new Set(['EU', 'EZ', 'UN', 'QO', 'XA', 'XB', 'ZZ', 'AC', 'CP', 'DG', 'EA', 'IC', 'TA', 'CQ'])
  const names = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })
  const out = new Set<string>()
  for (let a = 65; a <= 90; a++)
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b)
      if (skip.has(code)) continue
      const name = names.of(code)
      if (name && name !== code) out.add(name)
    }
  countryCache = [...out].sort((x, y) => x.localeCompare(y))
  return countryCache
}
