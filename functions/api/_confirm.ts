// Best-effort RSVP confirmation email, sent to the guest.
// Underscore-prefixed: not a route, just a helper module.
//
// Sends through Gmail (same OAuth method as the AntiGravityBottle site's
// notify-lead function) so no third-party email service is needed.
//
// Configure via Cloudflare Pages > Settings > Variables and Secrets
// (set for BOTH Production and Preview). Reuse the SAME values already in
// the AntiGravityBottle / antigravitybottle.com Pages project:
//   GMAIL_CLIENT_ID       - Google OAuth client id
//   GMAIL_CLIENT_SECRET   - Google OAuth client secret   (secret)
//   GMAIL_REFRESH_TOKEN   - Google OAuth refresh token    (secret)
//   GMAIL_SEND_FROM       - optional sender; defaults to andrew@margaheata.com
//
// If any Gmail credential is missing, the confirmation is skipped silently.
// A send failure never affects the visitor.

export interface ConfirmEnv {
  GMAIL_CLIENT_ID?: string
  GMAIL_CLIENT_SECRET?: string
  GMAIL_REFRESH_TOKEN?: string
  GMAIL_SEND_FROM?: string
}

export interface RsvpDetails {
  name: string
  email: string
  attendees: number
}

export async function sendRsvpConfirmation(env: ConfirmEnv, rsvp: RsvpDetails): Promise<void> {
  if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN) {
    return // not configured yet; skip silently
  }

  const from = env.GMAIL_SEND_FROM || 'andrew@margaheata.com'

  try {
    const accessToken = await getAccessToken(env)
    const raw = buildEmail(from, rsvp)
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: toBase64Url(raw) }),
    })
  } catch {
    // Never let a confirmation failure surface to the visitor.
  }
}

async function getAccessToken(env: ConfirmEnv): Promise<string> {
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

function buildEmail(from: string, rsvp: RsvpDetails): string {
  const firstName = rsvp.name.trim().split(/\s+/)[0] || 'friend'
  const party = rsvp.attendees === 1 ? '1 person' : `${rsvp.attendees} people`
  const subject = "Thank you for your RSVP - Joyce's Celebration of Life, September 6"

  const html =
    `<div style="max-width:540px;font:15px/1.6 Georgia,serif;color:#2f3a2c">` +
    `<p>Hi ${escapeHtml(firstName)},</p>` +
    `<p>Thank you for letting us know you'll be joining us to celebrate Joyce's life. ` +
    `We have you down for ${party}.</p>` +
    `<p style="margin:18px 0;padding:14px 18px;background:#f4f3ea;border-left:3px solid #6b7a66">` +
    `Sunday, September 6, 2026<br>` +
    `1:00&#8211;5:00 p.m. ET<br>` +
    `Winter Quarters Log Cabin<br>` +
    `Winter Quarters Drive, Pocomoke City, Maryland</p>` +
    `<p>If anything changes, or you have any questions, just reply to this email.</p>` +
    `<p>We look forward to seeing you.</p>` +
    `<p>Warmly,<br>Andrew</p>` +
    `</div>`

  const headers = [
    `From: ${from}`,
    `To: ${rsvp.email}`,
    `Reply-To: andrew@margaheata.com`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
  ]
  return headers.join('\r\n') + '\r\n\r\n' + html
}

function encodeSubject(subject: string): string {
  // RFC 2047 encode so the apostrophe and any non-ASCII survive all clients
  return `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
