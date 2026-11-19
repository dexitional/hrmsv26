// The SMS for a circular, built the same way for the form preview and for
// sending: the short note (or the message, or the subject), the reference and
// where to read the full circular.
export function circularSmsText(
  c: { letterNo: string | null; subject: string; message: string | null; smsNote: string | null; hasAttachment: boolean },
  opts: { email: boolean; portal: boolean },
) {
  const ref = c.letterNo ? ` (Ref: ${c.letterNo})` : ''
  const note = (c.smsNote || c.message || c.subject).trim().replace(/\s+/g, ' ')
  const more = c.hasAttachment && (opts.email || opts.portal) ? ` Full circular ${opts.email ? 'sent to your email' : 'on the staff portal'}.` : ''
  return `DHR CIRCULAR${ref}: ${note}${more} - DHR, UCC`
}
