// The optional payslip PIN lock: turn it on (choose a PIN), enter the PIN to
// unlock payslips (15 minutes in this browser), change it, or turn it off.
import { useEffect, useRef, useState } from 'react'
import { KeyRound, Loader2, LockKeyhole, LockKeyholeOpen, ShieldCheck } from 'lucide-react'
import { api, errorMessage } from '#/lib/api-client'
import { dateTime } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'

export type PinMode = 'set' | 'unlock' | 'change' | 'off'

const COPY: Record<PinMode, { title: string; description: string; submit: string }> = {
  set: { title: 'Turn on PIN lock', description: 'Choose a 4-digit PIN. Your payslips will then open only after you enter it. You can turn the lock off at any time.', submit: 'Turn on PIN lock' },
  unlock: { title: 'Unlock payslips', description: 'Enter your 4-digit PIN to unlock your payslips.', submit: 'Unlock' },
  change: { title: 'Change your payslip PIN', description: 'Enter your current PIN, then choose a new one.', submit: 'Change PIN' },
  off: { title: 'Turn off PIN lock', description: 'Enter your PIN. Your payslips will then open without it until you turn the lock on again.', submit: 'Turn off PIN lock' },
}

function PinInput({ label, value, onChange, autoFocus }: { label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 50)
  }, [autoFocus])
  return (
    <label className="block">
      <span className="mb-1.5 block text-center text-xs font-semibold text-slate-600">{label}</span>
      <input
        ref={ref}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        pattern="\d{4}"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="mx-auto block h-14 w-44 rounded-xl border bg-slate-50 text-center font-mono text-2xl tracking-[0.75em] text-slate-900 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}

export function PinDialog({ mode, lockedUntil, onClose, onDone }: { mode: PinMode | null; lockedUntil?: string | null; onClose: () => void; onDone: (unlockedUntil: string | null) => void }) {
  const [current, setCurrent] = useState('')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (mode) (setCurrent(''), setPin(''), setConfirm(''), setError(null))
  }, [mode])
  if (!mode) return null
  const copy = COPY[mode]
  const single = mode === 'unlock' || mode === 'off'
  const ready = single ? pin.length === 4 : pin.length === 4 && confirm.length === 4 && (mode === 'set' || current.length === 4)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    try {
      const r =
        mode === 'unlock'
          ? await api.post<{ unlockedUntil: string }>('/portal/payslips/unlock', { pin })
          : mode === 'off'
            ? await api.post<{ unlockedUntil?: string }>('/portal/payslips/pin/off', { pin })
            : await api.post<{ unlockedUntil: string }>('/portal/payslips/pin', { pin, confirm, current: mode === 'change' ? current : null })
      onDone(r.unlockedUntil ?? null)
    } catch (err) {
      setError(errorMessage(err))
      setPin('')
      setConfirm('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm"
        title={
          <span className="flex items-center gap-2">
            {mode === 'unlock' ? <LockKeyhole className="size-4 text-primary" /> : mode === 'off' ? <LockKeyholeOpen className="size-4 text-primary" /> : <KeyRound className="size-4 text-primary" />} {copy.title}
          </span>
        }
        description={copy.description}
      >
        <form onSubmit={submit} className="space-y-4">
          {lockedUntil && single ? (
            <p className="rounded-xl bg-secondary-light px-3 py-2 text-center text-sm text-secondary-light-foreground">
              Too many wrong PINs. Try again after {dateTime(lockedUntil)}, or ask HR to reset your PIN.
            </p>
          ) : (
            <>
              {mode === 'change' && <PinInput label="Current PIN" value={current} onChange={setCurrent} autoFocus />}
              <PinInput label={single ? 'PIN' : 'New PIN'} value={pin} onChange={setPin} autoFocus={mode !== 'change'} />
              {!single && <PinInput label="Enter the new PIN again" value={confirm} onChange={setConfirm} />}
              {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-center text-sm font-medium text-secondary-light-foreground">{error}</p>}
              <Button type="submit" className="w-full" disabled={!ready || busy}>
                {busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />} {copy.submit}
              </Button>
              {single && <p className="text-center text-xs text-muted-foreground">Forgotten your PIN? Ask the Directorate of Human Resource to reset it.</p>}
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
