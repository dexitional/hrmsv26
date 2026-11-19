// Outbound SMS and email.
//
// SMS:   mNotify (primary) — POST https://api.mnotify.com/api/sms/quick?key=<MNOTIFY_API_KEY>
//        SMSOnlineGH (backup) — POST https://api.smsonlinegh.com/v5/message/sms/send,
//        "Authorization: key <SMSONLINEGH_API_KEY>". When mNotify is not configured or
//        rejects a send, the message goes through SMSOnlineGH. The sender ID
//        (SMS_SENDER_ID, at most 11 characters) must be registered with both.
// Email: Google (Gmail) through Nodemailer with an App Password
//        (GMAIL_USER / GMAIL_APP_PASSWORD), sent from GMAIL_USER as MAIL_FROM_NAME.
//
// MESSAGING_SIMULATE=true (ignored in production) logs messages as "simulated"
// instead of sending them when a channel has no credentials.
//
// Every message is written to hrms_notifications with a dedupe key, so the
// same notification (e.g. one staff member's birthday this year) goes out once.
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { EMAIL_LOGO_BASE64, EMAIL_LOGO_CID } from './email-logo'
import { exec, one } from './db'

const MNOTIFY_URL = 'https://api.mnotify.com/api/sms/quick'
const SMSONLINEGH_URL = 'https://api.smsonlinegh.com/v5/message/sms/send'

const simulate = () => process.env.NODE_ENV !== 'production' && process.env.MESSAGING_SIMULATE === 'true'
const senderId = () => (process.env.SMS_SENDER_ID || 'UCC-DHR').slice(0, 11)

export function messagingStatus() {
  const mnotify = Boolean(process.env.MNOTIFY_API_KEY)
  const smsonlinegh = Boolean(process.env.SMSONLINEGH_API_KEY)
  const gmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  return {
    sms: { mnotify, smsonlinegh, sender: senderId(), simulated: !mnotify && !smsonlinegh && simulate() },
    email: { gmail, from: process.env.GMAIL_USER ?? null, simulated: !gmail && simulate() },
    scheduler: process.env.SCHEDULER_ENABLED === 'true',
  }
}

// ---------------------------------------------------------------- Addresses

/** Ghana numbers to international form: "024 412 3456" / "+233244123456" → "233244123456". */
export function normalizePhone(value: string | number | null | undefined): string | null {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10 && digits.startsWith('0')) return `233${digits.slice(1)}`
  if (digits.length === 9) return `233${digits}`
  if (digits.length === 12 && digits.startsWith('233')) return digits
  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const v = (value ?? '').trim().toLowerCase()
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : null
}

/** SMS in the cheaper GSM-7 alphabet: curly quotes, dashes and ellipses swapped for plain ones. */
export const plainSms = (text: string) =>
  text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\n]/g, '')
    .slice(0, 612)

// ---------------------------------------------------------------- Transports

interface Delivery {
  ok: boolean
  status: 'sent' | 'simulated' | 'failed' | 'skipped'
  provider?: string
  ref?: string | null
  error?: string | null
}

// SMS transports take a batch of numbers; one request covers the whole batch.
async function viaMnotify(to: Array<string>, text: string): Promise<Delivery> {
  const key = process.env.MNOTIFY_API_KEY!
  const res = await fetch(`${MNOTIFY_URL}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ recipient: to, sender: senderId(), message: text, is_schedule: false, schedule_date: '' }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null)
  const json = (await res?.json().catch(() => null)) as { status?: string; code?: string; message?: string; summary?: { _id?: string } } | null
  if (res?.ok && json?.status === 'success') return { ok: true, status: 'sent', provider: 'mnotify', ref: json.summary?._id ?? null }
  return { ok: false, status: 'failed', provider: 'mnotify', error: json?.message ?? (res ? `HTTP ${res.status}` : 'network error') }
}

async function viaSmsOnlineGh(to: Array<string>, text: string): Promise<Delivery> {
  const key = process.env.SMSONLINEGH_API_KEY!
  const res = await fetch(SMSONLINEGH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `key ${key}` },
    body: JSON.stringify({ text, type: 0, sender: senderId(), destinations: to }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null)
  const json = (await res?.json().catch(() => null)) as {
    handshake?: { id: number; label: string }
    data?: { batch?: string; destinations?: Array<{ id?: string; status?: { label: string } }> }
  } | null
  const label = json?.data?.destinations?.[0]?.status?.label ?? ''
  if (res?.ok && json?.handshake?.id === 0 && !/REJECT|ERR|INVALID|FAIL|BLACKLIST|BARRED/i.test(label)) {
    return { ok: true, status: 'sent', provider: 'smsonlinegh', ref: json.data?.destinations?.[0]?.id ?? json.data?.batch ?? null }
  }
  return { ok: false, status: 'failed', provider: 'smsonlinegh', error: label || json?.handshake?.label || (res ? `HTTP ${res.status}` : 'network error') }
}

/** mNotify first; SMSOnlineGH when mNotify is not set up or fails. */
async function deliverSms(target: string | Array<string>, text: string): Promise<Delivery> {
  const to = Array.isArray(target) ? target : [target]
  const errors: Array<string> = []
  if (process.env.MNOTIFY_API_KEY) {
    const r = await viaMnotify(to, text)
    if (r.ok) return r
    errors.push(`mNotify: ${r.error}`)
  }
  if (process.env.SMSONLINEGH_API_KEY) {
    const r = await viaSmsOnlineGh(to, text)
    if (r.ok) return { ...r, error: errors.length ? errors.join('; ') : null }
    errors.push(`SMSOnlineGH: ${r.error}`)
  }
  if (errors.length) return { ok: false, status: 'failed', error: errors.join('; ') }
  if (simulate()) {
    console.log(`[sms:simulated] ${senderId()} → ${to.length === 1 ? to[0] : `${to.length} numbers`}: ${text.slice(0, 90)}`)
    return { ok: true, status: 'simulated', provider: 'simulated' }
  }
  return { ok: false, status: 'skipped', error: 'SMS is not configured (MNOTIFY_API_KEY / SMSONLINEGH_API_KEY).' }
}

const globalMail = globalThis as typeof globalThis & { __hrmsMail?: Transporter }
function mailer() {
  if (!globalMail.__hrmsMail) {
    globalMail.__hrmsMail = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
  }
  return globalMail.__hrmsMail
}

export interface MailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

/** One address, or a batch sent as blind copies so recipients never see each other. */
async function deliverEmail(target: string | Array<string>, subject: string, html: string, text: string, files: Array<MailAttachment> = []): Promise<Delivery> {
  const batch = Array.isArray(target) && target.length > 1
  const to = Array.isArray(target) ? target : [target]
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const info = await mailer().sendMail({
        from: { name: process.env.MAIL_FROM_NAME || 'UCC Directorate of Human Resource', address: process.env.GMAIL_USER },
        ...(batch ? { bcc: to } : { to: to[0] }),
        subject,
        html,
        text,
        // The crest the email header points at (cid:…), carried inside the message.
        attachments: [
          ...(html.includes(`cid:${EMAIL_LOGO_CID}`)
            ? [{ filename: 'ucc-crest.png', content: Buffer.from(EMAIL_LOGO_BASE64, 'base64'), contentType: 'image/png', cid: EMAIL_LOGO_CID, contentDisposition: 'inline' as const }]
            : []),
          ...files,
        ],
      })
      return { ok: true, status: 'sent', provider: 'gmail', ref: info.messageId ?? null }
    } catch (err) {
      return { ok: false, status: 'failed', provider: 'gmail', error: err instanceof Error ? err.message : String(err) }
    }
  }
  if (simulate()) {
    console.log(`[email:simulated] → ${to.length === 1 ? to[0] : `${to.length} addresses`}: ${subject}`)
    return { ok: true, status: 'simulated', provider: 'simulated' }
  }
  return { ok: false, status: 'skipped', error: 'Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD).' }
}

// ---------------------------------------------------------------- Notify

const configured = (channel: 'sms' | 'email') =>
  channel === 'sms' ? Boolean(process.env.MNOTIFY_API_KEY || process.env.SMSONLINEGH_API_KEY) : Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

/**
 * Claims a dedupe key before sending, so a second run (or a parallel one)
 * stops here. A key already logged is reclaimed only when it never reached
 * anyone: a failed or skipped send, or a simulated one now that the gateway
 * is set up.
 */
async function claim(c: {
  kind: string
  channel: 'sms' | 'email'
  to: string
  name?: string | null
  staffNo?: number | null
  nssId?: number | null
  entityId?: number | null
  subject?: string | null
  message: string
  dedupe: string
}): Promise<boolean> {
  const claimed = await exec(
    `INSERT IGNORE INTO hrms_notifications
       (kind, channel, recipient, recipient_name, staff_no, nss_id, entity_id, subject, message, status, dedupe_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [c.kind, c.channel, c.to, c.name ?? null, c.staffNo ?? null, c.nssId ?? null, c.entityId ?? null, c.channel === 'email' ? (c.subject ?? null) : null, c.message, c.dedupe],
  )
  if (claimed.affectedRows) return true
  const prior = await one<{ status: string }>('SELECT status FROM hrms_notifications WHERE dedupe_key = ?', [c.dedupe])
  const retry = prior && (['failed', 'skipped'].includes(prior.status) || (prior.status === 'simulated' && configured(c.channel)))
  if (!retry) return false
  const reclaimed = await exec("UPDATE hrms_notifications SET status = 'pending', recipient = ?, message = ?, error = NULL WHERE dedupe_key = ? AND status = ?", [
    c.to,
    c.message,
    c.dedupe,
    prior.status,
  ])
  return reclaimed.affectedRows > 0
}

/** Writes one delivery result to every key it covers. */
async function record(keys: Array<string>, result: Delivery) {
  if (!keys.length) return
  await exec(
    `UPDATE hrms_notifications SET status = ?, provider = ?, provider_ref = ?, error = ?, sent_at = IF(? IN ('sent', 'simulated'), NOW(), NULL)
      WHERE dedupe_key IN (${keys.map(() => '?').join(', ')})`,
    [result.status, result.provider ?? null, result.ref ?? null, result.error?.slice(0, 500) ?? null, result.status, ...keys],
  )
}

export interface Notification {
  kind: string
  /** Unique per notification and channel, e.g. "leave_ended:27229". */
  key: string
  staffNo?: number | null
  nssId?: number | null
  entityId?: number | null
  name?: string | null
  phone?: string | number | null
  email?: string | null
  sms?: string | null
  subject?: string | null
  html?: string | null
  text?: string | null
  /** Files for the email (e.g. a circular's PDF). */
  attachments?: Array<MailAttachment>
  /** What the log keeps instead of the message, for secrets such as sign-in codes. */
  logText?: string
}

export interface NotifyResult {
  channel: 'sms' | 'email'
  status: Delivery['status'] | 'duplicate' | 'no-address'
}

/**
 * Sends a notification by SMS and/or email and logs each channel. A key that
 * was delivered before is never sent again; a failed or skipped send (or a
 * simulated one, once the gateway is configured) is retried.
 */
export async function notify(n: Notification): Promise<Array<NotifyResult>> {
  const out: Array<NotifyResult> = []
  const channels: Array<{ channel: 'sms' | 'email'; to: string | null; message: string | null | undefined }> = []
  if (n.sms) channels.push({ channel: 'sms', to: normalizePhone(n.phone), message: n.sms ? plainSms(n.sms) : null })
  if (n.subject && (n.html || n.text)) channels.push({ channel: 'email', to: normalizeEmail(n.email), message: n.text ?? n.subject })

  for (const c of channels) {
    if (!c.to || !c.message) {
      out.push({ channel: c.channel, status: 'no-address' })
      continue
    }
    const dedupe = `${n.key}:${c.channel}`.slice(0, 190)
    if (!(await claim({ kind: n.kind, channel: c.channel, to: c.to, name: n.name, staffNo: n.staffNo, nssId: n.nssId, entityId: n.entityId, subject: n.subject, message: n.logText ?? c.message, dedupe }))) {
      out.push({ channel: c.channel, status: 'duplicate' })
      continue
    }
    const result =
      c.channel === 'sms' ? await deliverSms(c.to, c.message) : await deliverEmail(c.to, n.subject!, n.html ?? `<p>${c.message}</p>`, n.text ?? c.message, n.attachments)
    await record([dedupe], result)
    out.push({ channel: c.channel, status: result.status })
  }
  return out
}

/** Fire-and-forget for request handlers: a notification never fails the request. */
export function notifyLater(n: Notification) {
  void notify(n).catch((err) => console.error('[notify] failed:', err))
}

/** A one-off message to check the gateways (not deduplicated). */
export async function sendTest(to: { phone?: string | null; email?: string | null }) {
  const stamp = new Date().toISOString()
  return notify({
    kind: 'test',
    key: `test:${stamp}:${Math.random().toString(36).slice(2, 8)}`,
    phone: to.phone,
    email: to.email,
    sms: to.phone ? `This is a test message from the UCC HRMS (${stamp.slice(0, 16).replace('T', ' ')} GMT).` : null,
    subject: to.email ? 'UCC HRMS test email' : null,
    text: 'This is a test email from the UCC HR Management System. If you received it, email notifications are working.',
  })
}

// ---------------------------------------------------------------- Bulk

export interface BulkRecipient {
  /** Unique per person, e.g. "circular:12:8436"; the channel is appended. */
  key: string
  staffNo?: number | null
  name?: string | null
  phone?: string | number | null
  email?: string | null
}

export type BulkTally = Record<'sent' | 'simulated' | 'failed' | 'skipped' | 'duplicate' | 'no-address', number>

const SMS_BATCH = 100
const EMAIL_BATCH = 50

/**
 * One message to many people on one channel (circulars). Numbers go to the
 * SMS gateway 100 per request; emails go 50 per message as blind copies. Every
 * person still gets their own log row, so a re-run sends only to those not yet
 * reached.
 */
export async function notifyBulk(opts: {
  kind: string
  channel: 'sms' | 'email'
  entityId?: number | null
  recipients: Array<BulkRecipient>
  sms?: string | null
  subject?: string | null
  html?: string | null
  text?: string | null
  attachments?: Array<MailAttachment>
  onProgress?: (tally: BulkTally) => void | Promise<void>
}): Promise<BulkTally> {
  const tally: BulkTally = { sent: 0, simulated: 0, failed: 0, skipped: 0, duplicate: 0, 'no-address': 0 }
  const message = opts.channel === 'sms' ? plainSms(opts.sms ?? '') : (opts.text ?? opts.subject ?? '')
  if (!message || (opts.channel === 'email' && !opts.subject)) return tally
  const seen = new Set<string>()
  const ready: Array<{ to: string; dedupe: string }> = []
  for (const r of opts.recipients) {
    const to = opts.channel === 'sms' ? normalizePhone(r.phone) : normalizeEmail(r.email)
    // One message per address, even when two staff records share it.
    if (!to || seen.has(to)) {
      tally['no-address'] += to ? 0 : 1
      if (to) tally.duplicate++
      continue
    }
    seen.add(to)
    const dedupe = `${r.key}:${opts.channel}`.slice(0, 190)
    const ok = await claim({ kind: opts.kind, channel: opts.channel, to, name: r.name, staffNo: r.staffNo, entityId: opts.entityId, subject: opts.subject, message, dedupe })
    if (ok) ready.push({ to, dedupe })
    else tally.duplicate++
  }
  const size = opts.channel === 'sms' ? SMS_BATCH : EMAIL_BATCH
  for (let i = 0; i < ready.length; i += size) {
    const batch = ready.slice(i, i + size)
    const to = batch.map((b) => b.to)
    const result =
      opts.channel === 'sms'
        ? await deliverSms(to, message)
        : await deliverEmail(to, opts.subject!, opts.html ?? `<p>${message}</p>`, message, opts.attachments)
    await record(
      batch.map((b) => b.dedupe),
      result,
    )
    tally[result.status] += batch.length
    await opts.onProgress?.(tally)
  }
  return tally
}

export async function lastNotification(kind: string) {
  return one('SELECT created_at, status FROM hrms_notifications WHERE kind = ? ORDER BY id DESC LIMIT 1', [kind])
}
