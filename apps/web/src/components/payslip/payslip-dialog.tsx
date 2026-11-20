// One payslip in the XPay portal's modal: the red mask button and the title
// in the header, the slip on the security paper, and Print / Close below.
// Print prints the slip straight from here: a print-only copy is kept beside
// the page (.payslip-print-root) and is the only thing on paper. Sizes, fonts
// and colours are in styles.css (.xpay-modal, .xpay-slip, .payslip-print-root).
// Used by the staff portal (behind the PIN) and the admin.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Eye, EyeOff, Loader2, Printer } from 'lucide-react'
import { ApiError, api, errorMessage } from '#/lib/api-client'
import { PayslipSheet } from './payslip-sheet'
import type { PayslipView } from './payslip-sheet'

export function PayslipDialog({
  id,
  title,
  endpoint,
  onClose,
  onLocked,
  actions,
}: {
  id: number | null
  /** e.g. "January 2026 Payslip" (shown while it loads too). */
  title: string
  /** API path of the payslip. */
  endpoint: string
  onClose: () => void
  /** The portal's unlock has expired: ask for the PIN again. */
  onLocked?: () => void
  actions?: (slip: PayslipView & Record<string, any>) => React.ReactNode
}) {
  const [masked, setMasked] = useState(false)
  const { data, isLoading, error } = useQuery({
    queryKey: ['payslip', endpoint],
    queryFn: async () => {
      try {
        return await api.get<PayslipView & Record<string, any>>(endpoint)
      } catch (err) {
        if (err instanceof ApiError && err.status === 423) onLocked?.()
        throw err
      }
    },
    enabled: id !== null,
    retry: false,
    staleTime: 60_000,
  })
  return (
    <DialogPrimitive.Root open={id !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="xpay-backdrop fixed inset-0 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <DialogPrimitive.Content className="xpay-modal outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-6" aria-describedby={undefined}>
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  onClick={() => setMasked((m) => !m)}
                  title={masked ? 'Unmask Payslip' : 'Mask Payslip'}
                  aria-pressed={masked}
                  className={`btn btn-in-modal-header btn-danger${masked ? ' active' : ''}`}
                >
                  {masked ? <Eye /> : <EyeOff />}
                  <span className="sr-only">{masked ? 'Unmask Payslip' : 'Mask Payslip'}</span>
                </button>
                <DialogPrimitive.Title className="modal-title">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Close className="close" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </DialogPrimitive.Close>
              </div>
              <div className="modal-body xpay-slip-paper">
                {isLoading ? (
                  <div className="flex justify-center py-20" style={{ color: '#76838f' }}>
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : error ? (
                  <p className="py-16 text-center">{errorMessage(error)}</p>
                ) : data ? (
                  <PayslipSheet slip={data} masked={masked} paper={false} />
                ) : null}
              </div>
              <div className="modal-footer">
                {data && (
                  <button type="button" className="btn btn-success" onClick={printSlip}>
                    <Printer /> Print Payslip
                  </button>
                )}
                {data && actions?.(data)}
                <DialogPrimitive.Close className="btn btn-default">Close</DialogPrimitive.Close>
              </div>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
      {data && id !== null && typeof document !== 'undefined' &&
        createPortal(
          <div className="payslip-print-root xpay-slip-paper" aria-hidden="true">
            <PayslipSheet slip={data} masked={masked} paper={false} />
          </div>,
          document.body,
        )}
    </DialogPrimitive.Root>
  )
}

/** Prints only the payslip (see .payslip-print-root in styles.css). */
function printSlip() {
  const root = document.documentElement
  root.classList.add('printing-payslip')
  const done = () => {
    root.classList.remove('printing-payslip')
    window.removeEventListener('afterprint', done)
  }
  window.addEventListener('afterprint', done)
  window.print()
}
