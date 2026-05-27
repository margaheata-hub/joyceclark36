interface Env {
  DB: D1Database
}

const MAX_NAME = 80
const MAX_REL = 80
const MAX_TITLE = 120
const MAX_BODY = 10000

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, relationship, title, body, created_at FROM stories ORDER BY created_at DESC LIMIT 500'
    ).all()
    return new Response(JSON.stringify({ stories: results || [] }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ stories: [], error: 'db_unavailable' }), { headers: JSON_HEADERS })
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { name?: string; relationship?: string; title?: string; body?: string }
  try { body = await request.json() } catch { return bad('invalid_json') }

  const name = (body.name || '').trim().slice(0, MAX_NAME)
  const relationship = (body.relationship || '').trim().slice(0, MAX_REL) || null
  const title = (body.title || '').trim().slice(0, MAX_TITLE)
  const storyBody = (body.body || '').trim().slice(0, MAX_BODY)

  if (!name || !title || !storyBody) return bad('missing_fields')

  try {
    await env.DB.prepare(
      'INSERT INTO stories (name, relationship, title, body) VALUES (?, ?, ?, ?)'
    ).bind(name, relationship, title, storyBody).run()
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'db_error' }), { status: 500, headers: JSON_HEADERS })
  }
}

function bad(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: JSON_HEADERS })
}
