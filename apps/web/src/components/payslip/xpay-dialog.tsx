// Resetting the staff member's XPay (payslip portal) password, as the old
// portal's XPay reset page did, for their own account only.
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { api, errorMessage } from '#/lib/api-client'
import { xpayPasswordSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Field } from '#/components/admin/form'

export function XpayPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const info = useQuery({ queryKey: ['portal', 'xpay'], queryFn: () => api.get<{ configured: boolean; username: string | null }>('/portal/payslips/xpay'), enabled: open })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (open) (setPassword(''), setConfirm(''), setError(null), setDone(false), setShow(false))
  }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = xpayPasswordSchema.safeParse({ password, confirm })
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Check the passwords')
    setBusy(true)
    setError(null)
    try {
      await api.post('/portal/payslips/xpay-password', { password, confirm })
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
      setPassword('')
      setConfirm('')
    }
  }
  const username = info.data?.username

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md"
        title={
          <span className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" /> Reset XPay password
          </span>
        }
        description="Set a new password for XPay, the University’s payslip portal."
      >
        {done ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
            <p className="text-sm text-slate-700">
              Your XPay password has been updated. Sign in to XPay as <b>{username}</b> with the new password.
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : info.isLoading ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : !info.data?.configured ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">XPay password reset is not set up on this server yet. Contact the Directorate of Finance or IT support.</p>
        ) : !username ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Your staff record has no UCC email, which is your XPay username. Ask HR to add it.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-center text-sm">
              Username: <b className="font-mono">{username}</b>
            </p>
            <Field label="New password" required hint="At least 8 characters.">
              <div className="relative">
                <Input type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="e.g. @password1234" className="pr-10" />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="Retype new password" required>
              <Input type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
            {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !password || !confirm}>
              {busy ? <Loader2 className="animate-spin" /> : <KeyRound />} Reset password
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
