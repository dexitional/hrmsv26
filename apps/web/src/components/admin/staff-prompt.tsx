// "Enter a staff number" prompt, used before opening a staff member's
// printable history or statistics.
import { useEffect, useState } from 'react'
import { Field } from './form'
import { FormDialog } from './form-dialog'
import type { StaffBrief } from './lookups'
import { StaffField } from './staff-field'

export function StaffPrompt({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Continue',
  onSubmit,
  children,
  busy,
  error,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  onSubmit: (staff: StaffBrief) => void
  children?: (staff: StaffBrief | null) => React.ReactNode
  busy?: boolean
  error?: string | null
}) {
  const [no, setNo] = useState<number | null>(null)
  const [staff, setStaff] = useState<StaffBrief | null>(null)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (open) (setNo(null), setStaff(null), setTouched(false))
  }, [open])
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      submitLabel={submitLabel}
      busy={busy}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (staff && staff.staffNo === no) onSubmit(staff)
      }}
    >
      <Field
        label="Staff number"
        required
        className="sm:col-span-2"
        error={touched && !(staff && staff.staffNo === no) ? 'Enter the number of an existing staff member' : undefined}
      >
        <StaffField value={no} onChange={setNo} onResolved={setStaff} />
      </Field>
      {children && <div className="sm:col-span-2">{children(staff && staff.staffNo === no ? staff : null)}</div>}
    </FormDialog>
  )
}
