// Shared, best-effort email notifier for site interactions.
// Underscore-prefixed: not a route, just a helper module.
//
// Sends a notification through Gmail (same method as the AntiGravityBottle
// site's notify-lead function) so no third-party email service is needed.
//
// Configure via Cloudflare Pages > Settings > Variables and Secrets
// (set for BOTH Production and Preview). Reuse the SAME values already in
// the AntiGravityBottle / antigravitybottle.com Pages project:
//   GMAIL_CLIENT_ID       - Google OAuth client id
//   GMAIL_CLIENT_SECRET   - Google OAuth client secret   (secret)
//   GMAIL_REFRESH_TOKEN   - Google OAuth refresh token    (secret)
//   NOTIFY_EMAIL          - where alerts are sent (e.g. andrew@margaheata.com)
//   GMAIL_SEND_FROM       - optional sender; defaults to margaheata@gmail.com
//
// If any Gmail credential or NOTIFY_EMAIL is missing, notifications are
// skipped silently. A send failure never affects the visitor.

export interface NotifyEnv {
  GMAIL_CLIENT_ID?: string
  GMAIL_CLIENT_SECRET?: string
  GMAIL_REFRESH_TOKEN?: string
  NOTIFY_EMAIL?: string
  GMAIL_SEND_FROM?: string
}

type Field = [label: string, value: string | number | null | undefined]

export async function sendNotify(env: NotifyEnv, subject: string, fields: Field[]): Promise<void> {
  const to = env.NOTIFY_EMAIL
  if (!to || !env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN) {
    return // not configured yet; skip silently
  }

  const from = env.GMAIL_SEND_FROM || 'margaheata@gmail.com'

  try {
    const accessToken = await getAccessToken(env)
    const raw = buildEmail(from, to, subject, fields)
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: toBase64Url(raw) }),
    })
  } catch {
    // Never let a notification failure surface to the visitor.
  }
}

async function getAccessToken(env: NotifyEnv): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID as string,
      client_secret: env.GMAIL_CLIENT_SECRET as string,
      refresh_token: env.GMAIL_REFRESH_TOKEN as string,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('token_refresh_failed')
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

function buildEmail(from: string, to: string, subject: string, fields: Field[]): string {
  const shown = fields.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')

  const rows = shown
    .map(
      ([label, v]) =>
        `<tr>` +
        `<td style="padding:6px 16px 6px 0;color:#6b7a66;font-weight:bold;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#2f3a2c;white-space:pre-wrap">${escapeHtml(String(v))}</td>` +
        `</tr>`,
    )
    .join('')

  const body =
    `<div style="font-family:sans-serif;max-width:540px">` +
    `<h2 style="color:#2f3a2c;font-size:17px">${escapeHtml(subject)}</h2>` +
    `<table style="border-collapse:collapse;font-size:14px">${rows}</table>` +
    `<p style="color:#94a08d;font-size:12px;margin-top:18px">Sent automatically from the Joyce Clark memorial site.</p>` +
    `</div>`

  const headers = [
    `From: Joyce Clark Memorial <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
  ].join('\r\n')

  return `${headers}\r\n\r\n${body}`
}

function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}
