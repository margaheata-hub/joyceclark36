// Shared, best-effort email notifier for site interactions.
// Underscore-prefixed: not a route, just a helper module.
//
// Configure via Cloudflare Pages > Settings > Environment variables
// (set for BOTH Production and Preview):
//   RESEND_API_KEY  - secret, from resend.com
//   NOTIFY_EMAIL    - where alerts are sent (your inbox)
//   NOTIFY_FROM     - optional; defaults to Resend's shared sender
//
// If RESEND_API_KEY or NOTIFY_EMAIL is missing, notifications are
// skipped silently. A send failure never affects the visitor.

export interface NotifyEnv {
  RESEND_API_KEY?: string
  NOTIFY_EMAIL?: string
  NOTIFY_FROM?: string
}

type Field = [label: string, value: string | number | null | undefined]

export async function sendNotify(env: NotifyEnv, subject: string, fields: Field[]): Promise<void> {
  const to = env.NOTIFY_EMAIL
  const key = env.RESEND_API_KEY
  if (!to || !key) return // not configured yet; skip silently

  const from = env.NOTIFY_FROM || 'Joyce Clark Memorial <onboarding@resend.dev>'

  const shown = fields.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')

  const rows = shown
    .map(
      ([label, v]) =>
        `<tr>` +
        `<td style="padding:4px 14px 4px 0;color:#6b7a66;font:13px system-ui,sans-serif;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:4px 0;color:#2f3a2c;font:13px system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(String(v))}</td>` +
        `</tr>`,
    )
    .join('')

  const html =
    `<div style="max-width:540px">` +
    `<p style="font:15px system-ui,sans-serif;color:#2f3a2c;margin:0 0 12px">${escapeHtml(subject)}</p>` +
    `<table style="border-collapse:collapse">${rows}</table>` +
    `<p style="font:12px system-ui,sans-serif;color:#94a08d;margin-top:18px">Sent automatically from the Joyce Clark memorial site.</p>` +
    `</div>`

  const text = shown.map(([label, v]) => `${label}: ${v}`).join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    if (!res.ok) {
      // Read + discard the body so the request settles; do not throw.
      await res.text().catch(() => {})
    }
  } catch {
    // Never let a notification failure surface to the visitor.
  }
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}
