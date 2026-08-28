import { sendRsvpConfirmation, type ConfirmEnv } from '../_confirm'

interface Env extends ConfirmEnv {
  DB: D1Database
  ADMIN_KEY: string
}

const MAX_NAME = 80
const MAX_EMAIL = 120
const MAX_MSG = 500

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : ''
  if (!env.ADMIN_KEY || token !== env.ADMIN_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, email, attendees, message, created_at FROM rsvps ORDER BY created_at DESC LIMIT 1000'
    ).all()
    const totalRow = await env.DB.prepare('SELECT COALESCE(SUM(attendees), 0) AS total FROM rsvps').first<{ total: number }>()
    return new Response(JSON.stringify({ rsvps: results || [], total_attendees: totalRow?.total || 0 }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ rsvps: [], total_attendees: 0, error: 'db_unavailable' }), { headers: JSON_HEADERS })
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  let body: { name?: string; email?: string; attendees?: number; message?: string }
  try { body = await request.json() } catch { return bad('invalid_json') }

  const name = (body.name || '').trim().slice(0, MAX_NAME)
  const email = (body.email || '').trim().slice(0, MAX_EMAIL)
  const attendeesRaw = Number(body.attendees)
  const attendees = Number.isFinite(attendeesRaw) && attendeesRaw >= 1 && attendeesRaw <= 20 ? Math.floor(attendeesRaw) : 1
  const message = (body.message || '').trim().slice(0, MAX_MSG) || null

  if (!name || !email) return bad('missing_fields')

  try {
    await env.DB.prepare(
      'INSERT INTO rsvps (name, email, attendees, message) VALUES (?, ?, ?, ?)'
    ).bind(name, email, attendees, message).run()
    // Confirmation email to the guest: best-effort, never blocks the response.
    waitUntil(sendRsvpConfirmation(env, { name, email, attendees }))
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'db_error' }), { status: 500, headers: JSON_HEADERS })
  }
}

function bad(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: JSON_HEADERS })
}
