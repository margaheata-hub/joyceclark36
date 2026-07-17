import { sendNotify, NotifyEnv } from './_notify'

interface Env extends NotifyEnv {
  DB: D1Database
}

const MAX_NAME = 60
const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const recent = await env.DB.prepare(
      'SELECT id, name, created_at FROM candles ORDER BY created_at DESC LIMIT 50'
    ).all()
    const total = await env.DB.prepare('SELECT COUNT(*) AS c FROM candles').first<{ c: number }>()
    return new Response(JSON.stringify({
      candles: recent.results || [],
      count: total?.c || 0,
    }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ candles: [], count: 0, error: 'db_unavailable' }), { headers: JSON_HEADERS })
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  let body: { name?: string }
  try { body = await request.json() } catch { return bad('invalid_json') }
  const name = (body.name || '').trim().slice(0, MAX_NAME)
  if (!name) return bad('missing_name')
  try {
    await env.DB.prepare('INSERT INTO candles (name) VALUES (?)').bind(name).run()
    waitUntil(sendNotify(env, `${name} lit a candle for Joyce`, [['Name', name]]))
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'db_error' }), { status: 500, headers: JSON_HEADERS })
  }
}

function bad(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: JSON_HEADERS })
}
