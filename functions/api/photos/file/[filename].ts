interface Env {
  PHOTOS: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const filename = params.filename
  if (typeof filename !== 'string') return new Response('not found', { status: 404 })

  const obj = await env.PHOTOS.get(filename)
  if (!obj) return new Response('not found', { status: 404 })

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('etag', obj.httpEtag)

  return new Response(obj.body, { headers })
}
