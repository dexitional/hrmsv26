import { useState } from 'react'
import { uccPhotoUrl } from '#/components/admin/page'

/** Passport-size staff photo from the UCC photo service, with initials if it fails. */
export function PassportPhoto({ staffNo, name }: { staffNo: number; name: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .replace(/^((Rev\.?|Prof\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|\(Mrs\.\))\s*)+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i, a) => (i === 0 || i === a.length - 1 ? p[0] : ''))
    .join('')
    .toUpperCase()
  return (
    <div className="flex h-[40mm] w-[32mm] items-center justify-center overflow-hidden border border-black bg-slate-100">
      {failed ? (
        <span className="font-sans text-[20pt] font-bold text-slate-500">{initials}</span>
      ) : (
        <img src={uccPhotoUrl(staffNo) ?? ''} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover object-top" />
      )}
    </div>
  )
}
