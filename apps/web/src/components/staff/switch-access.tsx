// Staff profile header actions (Admin → Staff → a staff member):
//  - Access USP: opens the old staff portal's HRMS entry for this staff
//    member for the day (https://staffportal.ucc.edu.gh/hrmsapp/{staff no}?token=YYYYMMDD).
//  - Switch Access (administrators and HR officers): use the staff portal as this staff
//    member sees it, then switch back from the banner there.
import { useState } from 'react'
import { ArrowLeftRight, ExternalLink, Loader2 } from 'lucide-react'
import { api, errorMessage } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { StaffField } from '#/components/admin/staff-field'

const USP_URL = 'https://staffportal.ucc.edu.gh/hrmsapp'

/** The old staff portal's token: today's date as YYYYMMDD. */
export function uspToken(d = new Date()) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function AccessUspButton({ staffNo }: { staffNo: number }) {
  // Built on click as well, so a page left open past midnight uses the new day's token.
  const href = () => `${USP_URL}/${staffNo}?token=${uspToken()}`
  return (
    <Button variant="outline" asChild>
      <a href={href()} target="_blank" rel="noopener noreferrer" onClick={(e) => (e.currentTarget.href = href())}>
        <ExternalLink /> Access USP
      </a>
    </Button>
  )
}

export function SwitchAccessButton({ staffNo }: { staffNo?: number }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ArrowLeftRight /> Switch Access
      </Button>
      <SwitchAccessDialog open={open} initial={staffNo ?? null} onClose={() => setOpen(false)} />
    </>
  )
}

function SwitchAccessDialog({ open, initial, onClose }: { open: boolean; initial: number | null; onClose: () => void }) {
  const [staffNo, setStaffNo] = useState<number | null>(initial)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const go = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffNo) return setError('Choose the staff member.')
    setBusy(true)
    setError(null)
    try {
      const r = await api.post<{ to: string }>('/auth/switch-access', { staffNo })
      window.location.assign(r.to)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setError(null))}
      title="Switch access"
      description="Use the staff portal exactly as this staff member sees it, including head of unit, dean or director tools. A banner there takes you back to your admin account. The switch is recorded in the activity log and lasts up to 2 hours."
      submitLabel={busy ? 'Switching…' : 'Switch to their portal'}
      busy={busy}
      error={error}
      onSubmit={go}
    >
      <Field label="Staff member" required className="sm:col-span-2">
        <StaffField value={staffNo} onChange={setStaffNo} />
      </Field>
      {busy && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
          <Loader2 className="size-4 animate-spin" /> Opening their staff portal…
        </p>
      )}
    </FormDialog>
  )
}
