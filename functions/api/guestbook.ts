import { sendNotify, NotifyEnv } from './_notify'

interface Env extends NotifyEnv {
  DB: D1Database
}

const MAX_NAME = 80
const MAX_REL  = 80
const MAX_MSG  = 2000

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, relationship, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 500'
    ).all()
    return new Response(JSON.stringify({ entries: results || [] }), { headers: JSON_HEADERS })
  } catch (e) {
    return new Response(JSON.stringify({ entries: [], error: 'db_unavailable' }), { headers: JSON_HEADERS })
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  let body: { name?: string; relationship?: string; message?: string }
  try { body = await request.json() } catch { return bad('invalid_json') }

  const name = (body.name || '').trim().slice(0, MAX_NAME)
  const relationship = (body.relationship || '').trim().slice(0, MAX_REL) || null
  const message = (body.message || '').trim().slice(0, MAX_MSG)

  if (!name || !message) return bad('missing_fields')

  try {
    await env.DB.prepare(
      'INSERT INTO guestbook (name, relationship, message) VALUES (?, ?, ?)'
    ).bind(name, relationship, message).run()
    waitUntil(sendNotify(env, `New guestbook message from ${name}`, [
      ['Name', name],
      ['Relationship', relationship],
      ['Message', message],
    ]))
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'db_error' }), { status: 500, headers: JSON_HEADERS })
  }
}

function bad(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: JSON_HEADERS })
}
