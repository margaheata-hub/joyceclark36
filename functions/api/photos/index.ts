interface Env {
  DB: D1Database
  PHOTOS: R2Bucket
}

const MAX_BYTES = 10 * 1024 * 1024
const MAX_NAME = 80
const MAX_CAPTION = 200
const MAX_ERA = 60

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, filename, uploader_name, caption, era, created_at FROM photos ORDER BY created_at DESC LIMIT 500'
    ).all()
    return new Response(JSON.stringify({ photos: results || [] }), { headers: JSON_HEADERS })
  } catch {
    return new Response(JSON.stringify({ photos: [], error: 'db_unavailable' }), { headers: JSON_HEADERS })
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return bad('invalid_form')
  }

  const file = form.get('photo')
  const uploader_name = (form.get('uploader_name')?.toString() || '').trim().slice(0, MAX_NAME)
  const caption = (form.get('caption')?.toString() || '').trim().slice(0, MAX_CAPTION)
  const era = (form.get('era')?.toString() || '').trim().slice(0, MAX_ERA)

  if (!(file instanceof File)) return bad('missing_file')
  if (!uploader_name || !caption || !era) return bad('missing_fields')

  if (!ALLOWED_TYPES.has(file.type)) return bad('unsupported_type')
  if (file.size === 0) return bad('empty_file')
  if (file.size > MAX_BYTES) return bad('too_large')

  const ext = EXT_BY_TYPE[file.type]
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  try {
    const buf = await file.arrayBuffer()
    await env.PHOTOS.put(filename, buf, {
      httpMetadata: { contentType: file.type },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'storage_error' }), { status: 500, headers: JSON_HEADERS })
  }

  try {
    await env.DB.prepare(
      'INSERT INTO photos (filename, content_type, uploader_name, caption, era, size_bytes) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(filename, file.type, uploader_name, caption, era, file.size).run()
  } catch {
    await env.PHOTOS.delete(filename).catch(() => {})
    return new Response(JSON.stringify({ ok: false, error: 'db_error' }), { status: 500, headers: JSON_HEADERS })
  }

  return new Response(JSON.stringify({ ok: true, filename }), { headers: JSON_HEADERS })
}

function bad(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: JSON_HEADERS })
}
