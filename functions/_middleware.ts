// Site-wide password gate.
// Set SITE_PASSWORD and COOKIE_SECRET as Cloudflare Pages environment variables.

interface Env {
  SITE_PASSWORD: string
  COOKIE_SECRET: string
}

const COOKIE_NAME = 'gg_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || ''
  for (const part of cookies.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function loginPage(error?: string): Response {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Joyce Clark</title>
<style>
  body { font-family: Georgia, serif; background: #f5efe3; color: #2d2e2b;
         display:flex; align-items:center; justify-content:center;
         min-height:100vh; margin:0; }
  .card { background:#fbf8f1; padding: 2.5rem 2rem; max-width: 380px; width: 90%;
          border: 1px solid #c7d6bd; box-shadow: 0 4px 20px rgba(45,55,41,0.08); }
  h1 { font-size: 1.8rem; margin: 0 0 .25rem; color: #2d3729; text-align:center; font-weight: 400; }
  p.sub { text-align:center; color:#4a5b43; font-style: italic; margin: 0 0 1.5rem; }
  label { display:block; font-size:.75rem; text-transform:uppercase; letter-spacing:.1em;
          color:#4a5b43; margin-bottom:.5rem; }
  input { width:100%; box-sizing:border-box; padding:.75rem; font-size:1rem;
          border:1px solid #a4ba95; background:#fff; color:#2d2e2b; }
  button { width:100%; margin-top:1rem; padding:.75rem; background:#3b4836; color:#fbf8f1;
           border:none; font-size:.85rem; letter-spacing:.15em; text-transform:uppercase; cursor:pointer; }
  button:hover { background:#2d3729; }
  .err { color:#985a40; font-size:.85rem; margin-top:.75rem; text-align:center; }
</style></head>
<body><div class="card">
  <h1>Joyce Clark</h1>
  <p class="sub">In loving memory</p>
  <form method="POST" action="/__auth">
    <label for="p">Password</label>
    <input id="p" name="password" type="password" autofocus required />
    <button type="submit">Enter</button>
    ${error ? `<div class="err">${error}</div>` : ''}
  </form>
</div></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)

  // Login submission
  if (url.pathname === '/__auth' && ctx.request.method === 'POST') {
    const form = await ctx.request.formData()
    const submitted = String(form.get('password') || '')
    if (submitted && submitted === ctx.env.SITE_PASSWORD) {
      const sig = await hmac(ctx.env.COOKIE_SECRET, 'ok')
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE_NAME}=${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
        },
      })
    }
    return loginPage('That password isn’t right. Please try again.')
  }

  // Already authed?
  const cookie = getCookie(ctx.request, COOKIE_NAME)
  if (cookie) {
    const expected = await hmac(ctx.env.COOKIE_SECRET, 'ok')
    if (cookie === expected) {
      return ctx.next()
    }
  }

  // Not authed — show login
  return loginPage()
}
