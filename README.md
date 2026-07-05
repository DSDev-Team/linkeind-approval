# LinkedIn Content Approval

A small internal tool for batch-approving LinkedIn posts before they go
out. Posts are grouped by week — review the copy/visuals for "next week"
and "the week after", then approve the whole week or individual posts.

> Single-approver workflow with a simple password gate and Vercel KV
> persistence.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** with a custom design system from `ui-ux-pro-max`
- **Vercel KV** (Upstash Redis) for persistence, with an in-memory
  fallback for local development
- **iron-session** for the signed password-gate cookie

## Local development

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev
```

Open http://localhost:3000. With no KV env vars set, the app uses an
in-memory store seeded with sample posts (data resets on restart).

## Production

1. Provision a **Vercel KV (Redis)** store and link it to the project —
   the env vars `KV_REST_API_URL` / `KV_REST_API_TOKEN` are injected
   automatically. See the Vercel dashboard → project → Storage.
2. Set `APPROVAL_PASSWORD` and `SESSION_SECRET` (32+ random chars) in
   Vercel project env vars. Default seed posts load once when the store
   is empty.

## Design system

See `design-system/linkedin-approval/MASTER.md` for the source-of-truth
design tokens (color, type, motion, density).