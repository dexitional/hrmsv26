// The staff member's payslips: a year at a time, a card per month, each slip
// behind the payslip PIN.
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, KeyRound, Lock, LockKeyhole, LockKeyholeOpen, Wallet } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { PageHeader } from '#/components/admin/page'
import { useSave } from '#/components/admin/mutations'
import { PayslipDialog } from '#/components/payslip/payslip-dialog'
import { PinDialog } from '#/components/payslip/pin-dialog'
import { XpayPasswordDialog } from '#/components/payslip/xpay-dialog'
import type { PinMode } from '#/components/payslip/pin-dialog'

export const Route = createFileRoute('/portal/payslips')({
  validateSearch: z.object({ year: z.number().int().optional() }),
  component: MyPayslips,
})

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type Overview = {
  years: Array<number>
  year: number
  months: Array<{ month: number; id: number | null }>
  pin: { set: boolean; lockedUntil: string | null }
  unlockedUntil: string | null
}

function MyPayslips() {
  const { year: wanted } = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'payslips', wanted ?? null], queryFn: () => api.get<Overview>('/portal/payslips', { year: wanted }) })
  const [opening, setOpening] = useState<{ id: number; month: number } | null>(null)
  const [viewing, setViewing] = useState<{ id: number; month: number } | null>(null)
  const [pinMode, setPinMode] = useState<PinMode | null>(null)
  const [until, setUntil] = useState<number | null>(null)
  const [xpay, setXpay] = useState(false)

  // The unlock lasts 15 minutes in this browser; the page relocks with it.
  useEffect(() => setUntil(data?.unlockedUntil ? Date.parse(data.unlockedUntil) : null), [data?.unlockedUntil])
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [])
  // The PIN lock is off unless the staff member turned it on (it stays on until they turn it off).
  const pinOn = Boolean(data?.pin.set)
  const unlocked = until !== null && until > now
  const minutesLeft = unlocked ? Math.max(1, Math.round((until - now) / 60_000)) : 0

  const lock = useSave(() => api.post('/portal/payslips/lock'), { invalidate: ['portal', 'payslips'], success: 'Payslips locked', onDone: () => (setUntil(null), queryClient.removeQueries({ queryKey: ['payslip'] })) })

  const year = data?.year ?? wanted ?? new Date().getFullYear()
  const years = data?.years.length ? data.years : [year]
  const at = years.indexOf(year)
  const goYear = (y: number) => navigate({ search: { year: y }, replace: true })

  const open = (m: { id: number; month: number }) => {
    if (!pinOn || unlocked) return setViewing(m)
    setOpening(m)
    setPinMode('unlock')
  }
  const onPinDone = (unlockedUntil: string | null) => {
    const mode = pinMode
    setUntil(unlockedUntil ? Date.parse(unlockedUntil) : null)
    setPinMode(null)
    queryClient.invalidateQueries({ queryKey: ['portal', 'payslips'] })
    queryClient.removeQueries({ queryKey: ['payslip'] })
    if (mode === 'set') toast.success('PIN lock is on. Your payslips now open with your PIN.')
    if (mode === 'off') toast.success('PIN lock is off. Your payslips open without a PIN.')
    if (mode === 'change') toast.success('PIN changed')
    if (opening) (setViewing(opening), setOpening(null))
  }

  return (
    <>
      <XpayPasswordDialog open={xpay} onClose={() => setXpay(false)} />
      <PinDialog mode={pinMode} lockedUntil={data?.pin.lockedUntil} onClose={() => (setPinMode(null), setOpening(null))} onDone={onPinDone} />
      {viewing && (
        <PayslipDialog
          id={viewing.id}
          title={`${MONTHS[viewing.month - 1]} ${year} Payslip`}
          endpoint={`/portal/payslips/${viewing.id}`}
          onClose={() => setViewing(null)}
          onLocked={() => (setUntil(null), setOpening(viewing), setViewing(null), setPinMode('unlock'))}
        />
      )}

      <PageHeader
        eyebrow="Staff services"
        title="Payslips"
        description="Your monthly payslips from the Directorate of Finance. Turn on the PIN lock if you want them to open only with a 4-digit PIN."
        actions={
          data && (
            <>
              <Button variant="outline" onClick={() => setXpay(true)}>
                <Wallet /> Reset XPay password
              </Button>
              {pinOn && unlocked && (
                <Button variant="outline" onClick={() => lock.mutate(undefined)}>
                  <Lock /> Lock payslips
                </Button>
              )}
              {pinOn && (
                <Button variant="outline" onClick={() => setPinMode('change')}>
                  <KeyRound /> Change PIN
                </Button>
              )}
              {pinOn ? (
                <Button variant="outline" onClick={() => setPinMode('off')}>
                  <LockKeyholeOpen /> Turn off PIN lock
                </Button>
              ) : (
                <Button onClick={() => setPinMode('set')}>
                  <LockKeyhole /> Turn on PIN lock
                </Button>
              )}
            </>
          )
        }
      />

      {/* Year slider */}
      <div role="toolbar" aria-label="Year" className="relative mb-5 flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-2 py-3 text-white">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <button
          type="button"
          onClick={() => goYear(years[at - 1]!)}
          disabled={at <= 0}
          className="relative flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          aria-label="Newer year"
        >
          <span className="slick-glyph text-[32px] opacity-75" aria-hidden="true">
            ←
          </span>
        </button>
        <div className="no-scrollbar relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => goYear(y)}
              aria-pressed={y === year}
              className={cn('shrink-0 rounded-xl px-4 py-1.5 font-extrabold tabular-nums transition-all', y === year ? 'bg-white text-2xl text-primary shadow-sm' : 'text-lg text-white/60 hover:bg-white/10 hover:text-white')}
            >
              {y}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goYear(years[at + 1]!)}
          disabled={at < 0 || at >= years.length - 1}
          className="relative flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          aria-label="Older year"
        >
          <span className="slick-glyph text-[32px] opacity-75" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {years.length > 1 && (
        <div className="-mt-3 mb-4 flex justify-center gap-1" role="tablist" aria-label="Years">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={y === year}
              aria-label={String(y)}
              onClick={() => goYear(y)}
              className={cn('slick-glyph flex size-5 items-center justify-center text-[8px] text-black', y === year ? 'opacity-75' : 'opacity-25 hover:opacity-50')}
            >
              •
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{year} Payslips</h2>
        {data && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              !pinOn ? 'bg-slate-100 text-slate-600' : unlocked ? 'bg-success-soft text-emerald-700' : 'bg-primary-soft text-primary',
            )}
          >
            {!pinOn || unlocked ? <LockKeyholeOpen className="size-3.5" /> : <Lock className="size-3.5" />}
            {!pinOn ? 'PIN lock off' : unlocked ? `PIN lock on · unlocked for ${minutesLeft} more minute${minutesLeft === 1 ? '' : 's'}` : 'PIN lock on'}
          </span>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {(data?.months ?? Array.from({ length: 12 }, (_, i) => ({ month: i + 1, id: null }))).map((m) => {
          const available = m.id !== null
          return (
            <li key={m.month}>
              {available ? (
                <button
                  type="button"
                  onClick={() => open({ id: m.id!, month: m.month })}
                  className="group relative flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border bg-white text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <FileText className="mb-2 size-5 text-primary/70" />
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">{MONTHS[m.month - 1]}</span>
                  <span className="text-sm text-muted-foreground">Payslip</span>
                  <span className="absolute inset-0 flex items-center justify-center overflow-hidden bg-primary/90 px-4 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {/* The crest, light on the blue, as on the sign-in page. */}
                    <img
                      src="/ucc-crest-sm.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-auto -translate-x-1/2 -translate-y-1/2 scale-90 opacity-[0.22] mix-blend-luminosity transition-transform duration-300 select-none group-hover:scale-100"
                    />
                    <span className="relative w-full rounded-xl bg-white py-2 text-sm font-semibold text-primary shadow-sm">See slip</span>
                  </span>
                </button>
              ) : (
                <div className={cn('flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50/70 text-center', isLoading && 'animate-pulse')}>
                  <span className="text-xl font-extrabold tracking-tight text-slate-400">{MONTHS[m.month - 1]}</span>
                  <span className="text-sm text-slate-400">Payslip</span>
                  {!isLoading && <span className="mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Not available</span>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {data && !data.years.length && <p className="mt-4 text-center text-sm text-muted-foreground">No payslips have been released to you yet.</p>}
    </>
  )
}
