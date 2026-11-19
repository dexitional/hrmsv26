// The wording of every message the HRMS sends: SMS text plus a branded email.
// Messages are addressed formally ("Dear Dr. Mensah") and signed by the
// Directorate of Human Resource.
import { properName } from '#/lib/text-case'
import { EMAIL_LOGO_CID } from './email-logo'
import { circularSmsText } from '#/lib/circular-sms'

const SIGN_OFF = 'Directorate of Human Resource, UCC'
const SMS_SIGN = '- DHR, UCC'

// ---------------------------------------------------------------- Helpers

const parse = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, day ?? 1)
}
/** "Monday, 15 March 2027" */
export const longDate = (d: string | null | undefined) =>
  d ? parse(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
/** "15 Mar 2027" */
const shortDate = (d: string | null | undefined) =>
  d ? parse(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

// Courtesy titles that imply a gender. When one contradicts the recorded
// gender (legacy data has hundreds of "Ms." men), neither field can be trusted,
// so the message falls back to the person's name rather than guessing.
const MALE_TITLES = new Set(['MR'])
const FEMALE_TITLES = new Set(['MS', 'MRS', 'MISS', 'MADAM'])

const cleanTitle = (p: Person) => {
  const v = (p.title ?? '').trim()
  if (!v || v === '-- Select --') return ''
  const key = v.replace(/\./g, '').toUpperCase()
  const g = (p.gender ?? '').toUpperCase()
  if ((MALE_TITLES.has(key) && g === 'F') || (FEMALE_TITLES.has(key) && g === 'M')) return ''
  return v
}

export interface Person {
  title?: string | null
  fname?: string | null
  lname?: string | null
  gender?: string | null
}

/** "Dr. Mensah" when there is a title, otherwise "Ama Mensah". */
export function salutation(p: Person) {
  const last = properName(p.lname ?? '') ?? ''
  const first = properName((p.fname ?? '').split(/\s+/)[0] ?? '') ?? ''
  const title = cleanTitle(p)
  return title ? `${title} ${last}`.trim() : `${first} ${last}`.trim()
}

/** How a warm greeting opens: "Dr. Mensah" with a usable title, otherwise just "Ama". */
export function greetingName(p: Person) {
  const salute = salutation(p)
  return cleanTitle(p) ? salute : (salute.split(' ')[0] ?? salute)
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Email shell: navy UCC header, white card, quiet footer. Inline styles for mail clients. */
function emailLayout({ preheader, heading, body, accent = '#172554' }: { preheader: string; heading: string; body: string; accent?: string }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e8ee">
<tr><td style="background:${accent};padding:20px 24px;color:#ffffff">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td width="73" valign="middle" style="width:73px;padding:0 14px 0 0">
<div style="background:#ffffff;border-radius:10px;padding:6px 8px;width:57px;line-height:0"><img src="cid:${EMAIL_LOGO_CID}" width="57" height="64" alt="UCC crest" style="display:block;width:57px;height:64px;border:0;outline:none"></div>
</td>
<td valign="middle" style="color:#ffffff">
<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#cbd5e1">University of Cape Coast</div>
<div style="font-size:18px;line-height:1.3;font-weight:bold;margin-top:4px;color:#ffffff">Directorate of Human Resource</div>
</td>
</tr></table>
</td></tr>
<tr><td style="height:4px;background:#fee2e2"></td></tr>
<tr><td style="padding:30px 28px 8px">
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#172554">${esc(heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.6">
<p style="margin:18px 0 0">Yours faithfully,<br><strong>${SIGN_OFF}</strong></p>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 28px;font-size:12px;color:#64748b;border-top:1px solid #e6e8ee">
This message was sent by the UCC HR Management System. For enquiries, please contact the Directorate of Human Resource.
</td></tr>
</table></td></tr></table></body></html>`
}

const p = (text: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65">${text}</p>`
const highlight = (label: string, value: string, tint = '#eef1fa', ink = '#172554') =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px"><tr><td style="background:${tint};border-radius:10px;padding:14px 18px">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#64748b">${esc(label)}</div>
<div style="font-size:18px;font-weight:bold;color:${ink};margin-top:4px">${esc(value)}</div></td></tr></table>`

export interface Message {
  sms: string
  subject: string
  html: string
  text: string
}

// ---------------------------------------------------------------- Leave

export function leaveEnded(m: { salute: string; type: string; startDate: string; endDate: string; resumeDate: string | null }): Message {
  const leave = `${(m.type || 'annual').toLowerCase()} leave`
  const resume = m.resumeDate ? longDate(m.resumeDate) : 'the next working day'
  return {
    sms: `Dear ${m.salute}, your ${leave} ended on ${shortDate(m.endDate)}. Please report for duty on ${m.resumeDate ? shortDate(m.resumeDate) : 'the next working day'}. We trust you are well rested. Welcome back! ${SMS_SIGN}`,
    subject: `Your ${leave} has ended — resume on ${m.resumeDate ? shortDate(m.resumeDate) : 'the next working day'}`,
    html: emailLayout({
      preheader: `Please report for duty on ${resume}.`,
      heading: 'Your leave has ended',
      body:
        p(`Dear ${esc(m.salute)},`) +
        p(`This is to inform you that your ${esc(leave)}, which began on ${esc(longDate(m.startDate))}, ended on <strong>${esc(longDate(m.endDate))}</strong>.`) +
        highlight('Resumption of duty', resume) +
        p('We trust you had a restful time and look forward to having you back. Kindly report to your head of unit on resumption.'),
    }),
    text: `Dear ${m.salute},\n\nYour ${leave}, which began on ${longDate(m.startDate)}, ended on ${longDate(m.endDate)}. Please report for duty on ${resume}.\n\nWe trust you had a restful time and look forward to having you back.\n\n${SIGN_OFF}`,
  }
}

export function leaveReminder(m: { salute: string; type: string; endDate: string; resumeDate: string | null; daysLeft: number }): Message {
  const leave = `${(m.type || 'annual').toLowerCase()} leave`
  const resume = m.resumeDate ? longDate(m.resumeDate) : 'the next working day'
  const when = m.daysLeft === 1 ? 'tomorrow' : `in ${m.daysLeft} days`
  return {
    sms: `Dear ${m.salute}, a gentle reminder that your ${leave} ends ${when}, on ${shortDate(m.endDate)}. You are expected to resume duty on ${m.resumeDate ? shortDate(m.resumeDate) : 'the next working day'}. ${SMS_SIGN}`,
    subject: `Reminder: your ${leave} ends on ${shortDate(m.endDate)}`,
    html: emailLayout({
      preheader: `Your leave ends ${when}. You resume on ${resume}.`,
      heading: `Your leave ends ${when}`,
      body:
        p(`Dear ${esc(m.salute)},`) +
        p(`This is a gentle reminder that your ${esc(leave)} will come to an end on <strong>${esc(longDate(m.endDate))}</strong>.`) +
        highlight('Expected resumption', resume, '#fef3c7', '#92400e') +
        p('Kindly plan to resume duty accordingly. If you need to discuss your leave, please contact the Directorate of Human Resource before it ends.'),
      accent: '#172554',
    }),
    text: `Dear ${m.salute},\n\nThis is a gentle reminder that your ${leave} ends on ${longDate(m.endDate)}. You are expected to resume duty on ${resume}.\n\n${SIGN_OFF}`,
  }
}

// ---------------------------------------------------------------- Birthday

export function birthday(m: { salute: string; firstName: string; yearsOfService: number | null; unit: string | null }): Message {
  const service =
    m.yearsOfService && m.yearsOfService >= 1
      ? ` Thank you for ${m.yearsOfService} year${m.yearsOfService === 1 ? '' : 's'} of dedicated service to the University.`
      : ' Thank you for your dedicated service to the University.'
  return {
    sms: `Dear ${m.salute}, happy birthday! On behalf of the Directorate of Human Resource, we celebrate you today.${service} May this new year bring you good health, joy and fulfilment in all you do. ${SMS_SIGN}`,
    subject: `Happy birthday, ${m.salute}!`,
    html: emailLayout({
      preheader: 'Warm wishes on your birthday from the Directorate of Human Resource.',
      heading: `Happy birthday, ${m.firstName}!`,
      body:
        p(`Dear ${esc(m.salute)},`) +
        p('On behalf of the Directorate of Human Resource, we join your family, friends and colleagues in celebrating you on your birthday.') +
        p(
          m.yearsOfService && m.yearsOfService >= 1
            ? `We are grateful for the ${m.yearsOfService} year${m.yearsOfService === 1 ? '' : 's'} of commitment and service you have given to the University of Cape Coast${m.unit ? `, and for all you bring to ${esc(properName(m.unit) ?? m.unit)}` : ''}.`
            : `We are grateful for the commitment and service you give to the University of Cape Coast${m.unit ? ` and to ${esc(properName(m.unit) ?? m.unit)}` : ''}.`,
        ) +
        highlight('Our wish for you', 'Good health, joy and fulfilment in the year ahead', '#fff5f5', '#991b1b') +
        p('May this new year of your life be filled with peace, good health and many reasons to smile. Enjoy your special day.'),
    }),
    text: `Dear ${m.salute},\n\nOn behalf of the Directorate of Human Resource, we celebrate you on your birthday.${service}\n\nMay this new year of your life be filled with peace, good health and many reasons to smile. Enjoy your special day.\n\n${SIGN_OFF}`,
  }
}

// ---------------------------------------------------------------- National service

export function nssThanks(m: { firstName: string; unit: string | null; startDate: string | null; endDate: string | null }): string {
  const where = m.unit ? ` at ${properName(m.unit)}` : ''
  const period = m.startDate && m.endDate ? ` (${shortDate(m.startDate)} - ${shortDate(m.endDate)})` : ''
  return `Dear ${m.firstName}, as your national service with the University of Cape Coast${where} comes to an end, the Directorate of Human Resource thanks you for your dedication and hard work${period}. We wish you success and fulfilment in all that lies ahead. ${SMS_SIGN}`
}

// ---------------------------------------------------------------- Transfer

export function transferEffected(m: { salute: string; fromUnit: string | null; toUnit: string; date: string; designation: string | null }): Message {
  const to = properName(m.toUnit) ?? m.toUnit
  const from = m.fromUnit ? (properName(m.fromUnit) ?? m.fromUnit) : null
  return {
    sms: `Dear ${m.salute}, please be informed that you have been transferred${from ? ` from ${from}` : ''} to ${to.toUpperCase()} with effect from ${shortDate(m.date)}. Kindly report to your new unit accordingly. ${SMS_SIGN}`,
    subject: `Notice of transfer to ${to}`,
    html: emailLayout({
      preheader: `You have been transferred to ${to} with effect from ${longDate(m.date)}.`,
      heading: 'Notice of transfer',
      body:
        p(`Dear ${esc(m.salute)},`) +
        p(`Please be informed that you have been transferred${from ? ` from <strong>${esc(from)}</strong>` : ''}${m.designation ? ` as ${esc(properName(m.designation) ?? m.designation)}` : ''} to:`) +
        highlight('New unit', to) +
        highlight('Effective date', longDate(m.date), '#f1f5f9') +
        p('Kindly report to the head of your new unit on the effective date. We wish you every success in your new role.'),
    }),
    text: `Dear ${m.salute},\n\nPlease be informed that you have been transferred${from ? ` from ${from}` : ''} to ${to} with effect from ${longDate(m.date)}. Kindly report to the head of your new unit on the effective date.\n\n${SIGN_OFF}`,
  }
}

// ---------------------------------------------------------------- Disciplinary

const ACTION_WORDS: Record<string, string> = {
  WARNING: 'a warning',
  SUSPENSION: 'a suspension',
  INTERDICTION: 'an interdiction',
  DISMISSAL: 'a dismissal',
  TERMINATION: 'a termination of appointment',
}

export function disciplinaryIssued(m: { salute: string; actionType: string; issueDate: string }): Message {
  const action = ACTION_WORDS[m.actionType] ?? m.actionType.toLowerCase()
  const label = m.actionType.charAt(0) + m.actionType.slice(1).toLowerCase()
  return {
    sms: `Dear ${m.salute}, this is to notify you that ${action} was issued against you on ${shortDate(m.issueDate)}. Please contact the Directorate of Human Resource for further details. ${SMS_SIGN}`,
    subject: `Notice of disciplinary action: ${label}`,
    html: emailLayout({
      preheader: `${label} issued on ${longDate(m.issueDate)}.`,
      heading: 'Notice of disciplinary action',
      body:
        p(`Dear ${esc(m.salute)},`) +
        p(`This is to formally notify you that ${esc(action)} has been issued against you.`) +
        highlight('Action', label, '#fff5f5', '#991b1b') +
        highlight('Date issued', longDate(m.issueDate), '#f1f5f9') +
        p('Please contact the Directorate of Human Resource for the details of this action and any next steps.'),
    }),
    text: `Dear ${m.salute},\n\nThis is to formally notify you that ${action} was issued against you on ${longDate(m.issueDate)}. Please contact the Directorate of Human Resource for further details.\n\n${SIGN_OFF}`,
  }
}

// ---------------------------------------------------------------- Circulars

/** Plain-text paragraphs to email HTML, with web links made clickable. */
function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      p(
        esc(block)
          .replace(/\n/g, '<br>')
          .replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" style="color:#1d4ed8">${url}</a>`),
      ),
    )
    .join('')
}

export interface CircularContent {
  letterNo: string | null
  subject: string
  message: string | null
  smsNote: string | null
  date: string
  attachmentName: string | null
}

/** The SMS: the short note (or the subject), with the reference and where to read more. */
export function circularSms(c: CircularContent, opts: { email: boolean; portal: boolean }) {
  return circularSmsText({ ...c, hasAttachment: Boolean(c.attachmentName) }, opts)
}

export function circularEmail(c: CircularContent, opts: { portal: boolean }): Omit<Message, 'sms'> {
  const ref = c.letterNo ? `Ref: ${c.letterNo}` : null
  const body =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr>` +
    `<td style="font-size:12px;color:#64748b">${esc(longDate(c.date))}</td>` +
    (ref ? `<td align="right" style="font-size:12px;color:#64748b;font-family:monospace">${esc(ref)}</td>` : '') +
    `</tr></table>` +
    p('Dear Colleague,') +
    (c.message ? paragraphs(c.message) : p(esc(c.subject))) +
    (c.attachmentName
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px"><tr><td style="background:#eef1fa;border-radius:10px;padding:14px 18px">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#64748b">Attached</div>
<div style="font-size:15px;font-weight:bold;color:#172554;margin-top:4px">${esc(c.attachmentName)}</div>
<div style="font-size:13px;color:#475569;margin-top:2px">Please open the attached PDF for the full circular.${opts.portal ? ' It is also on the staff portal.' : ''}</div></td></tr></table>`
      : '')
  return {
    subject: `DHR Circular: ${c.subject}`,
    html: emailLayout({ preheader: (c.smsNote || c.message || c.subject).slice(0, 140), heading: c.subject, body }),
    text: `${longDate(c.date)}${ref ? ` · ${ref}` : ''}\n\nDear Colleague,\n\n${c.message || c.subject}${c.attachmentName ? `\n\nAttached: ${c.attachmentName}` : ''}\n\n${SIGN_OFF}`,
  }
}
