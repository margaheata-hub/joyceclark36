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

  await env.DB.prepare('DELETE FROM stories WHERE id = ?').bind(id).run()
  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
}
