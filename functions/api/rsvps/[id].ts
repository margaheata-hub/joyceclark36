interface Env {
  DB: D1Database
  ADMIN_KEY: string
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : ''
  if (!env.ADMIN_KEY || token !== env.ADMIN_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  const id = Number(params.id)
  if (!Number.isFinite(id) || id <= 0) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_id' }), { status: 400, headers: JSON_HEADERS })
  }

  await env.DB.prepare('DELETE FROM rsvps WHERE id = ?').bind(id).run()
  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
}

// Admin-only correction of an existing RSVP (e.g. fixing a party size a guest
// could not set themselves). Does NOT trigger a confirmation email.
export const onRequestPatch: PagesFunction<Env> = async ({ params, request, env }) => {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : ''
  if (!env.ADMIN_KEY || token !== env.ADMIN_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  const id = Number(params.id)
  if (!Number.isFinite(id) || id <= 0) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_id' }), { status: 400, headers: JSON_HEADERS })
  }

  let body: { attendees?: number; name?: string; email?: string; message?: string }
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), { status: 400, headers: JSON_HEADERS })
  }

  const sets: string[] = []
  const binds: (string | number)[] = []
  if (body.attendees !== undefined) {
    const n = Number(body.attendees)
    if (!Number.isFinite(n) || n < 1 || n > 20) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_attendees' }), { status: 400, headers: JSON_HEADERS })
    }
    sets.push('attendees = ?'); binds.push(Math.floor(n))
  }
  if (body.name !== undefined) { sets.push('name = ?'); binds.push(String(body.name).trim().slice(0, 80)) }
  if (body.email !== undefined) { sets.push('email = ?'); binds.push(String(body.email).trim().slice(0, 120)) }
  if (body.message !== undefined) { sets.push('message = ?'); binds.push(String(body.message).trim().slice(0, 500)) }

  if (!sets.length) {
    return new Response(JSON.stringify({ ok: false, error: 'no_fields' }), { status: 400, headers: JSON_HEADERS })
  }

  binds.push(id)
  await env.DB.prepare(`UPDATE rsvps SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run()
  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
}
