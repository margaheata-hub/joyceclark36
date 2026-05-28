# joyceclark36

In loving memory of Joyce Clark (July 8, 1936 – May 25, 2026).

Private memorial site for family and friends. Built with Vite + React + TypeScript + Tailwind, deployed on Cloudflare Pages.

## Local

```
npm install
npm run dev
```

## Deploy

Auto-deploys via Cloudflare Pages on push to `main` (production) and `staging` (preview).

## Environment variables (Cloudflare Pages → Settings → Environment variables)

- `SITE_PASSWORD` — single shared password
- `COOKIE_SECRET` — random string used to sign auth cookies (rotate to force re-login)
