# Nexora Marketing Site & Waitlist

The public-facing landing page for **Nexora** — a Web3 platform for trading
tokenized global equities on the Avalanche C-Chain. This site exists to build
hype ahead of launch and collect email signups for the waitlist.

This is a separate Next.js app from `../frontend` (the actual trading app).
Keeping them separate means the marketing site can be iterated on and deployed
independently without touching the product.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **Framer Motion** for scroll reveals and micro-interactions
- **lucide-react** for icons
- **axios** to talk to the existing Nexora backend's `/api/waitlist` endpoints

## Getting started

```bash
npm install
npm run dev
```

The site runs at [http://localhost:3100](http://localhost:3100) by default
(a different port than `frontend`, so you can run both side by side).

Set `NEXT_PUBLIC_BACKEND_URL` to point at your Nexora backend (defaults to
`http://127.0.0.1:5001`, matching `../backend`):

```bash
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5001 npm run dev
```

## Waitlist data

Signups are stored in the same Postgres database as the rest of the app, in a
`waitlist` table (see `../backend/src/db.ts`). Two endpoints back this site:

- `POST /api/waitlist` — `{ email, referrer? }` → joins the waitlist (idempotent
  per email), returns the signup's position and the running total.
- `GET /api/waitlist/stats` — returns `{ total }`, used to render the live
  "N people already on the list" counter.

An optional `WAITLIST_BASE_COUNT` env var on the backend lets you seed the
public counter with a starting number (e.g. from an off-platform pre-launch
campaign) without inserting fake rows into the database. It defaults to `0`.

## Structure

```
src/
├── app/
│   ├── layout.tsx      # fonts, metadata/SEO, root shell
│   ├── page.tsx         # composes all landing page sections
│   └── globals.css      # design tokens, gradients, animation keyframes
├── components/           # Nav, Hero, TickerTape, Features, Assets,
│                          # HowItWorks, WaitlistForm, WaitlistCTA, FAQ, Footer
└── lib/
    ├── api.ts            # axios client for the waitlist endpoints
    └── data.ts            # asset list, feature copy, steps, FAQ content
```

## Editing content

Nearly all copy (features, FAQ, steps, tokenized asset list/prices) lives in
`src/lib/data.ts` — update it there rather than hunting through components.

## Deploying

This app ships its own `vercel.json` and can be deployed as its own Vercel
project (recommended: point a domain like `nexora.xyz` or `www.nexora.xyz` at
it, while the trading app lives at `app.nexora.xyz`). Set the
`NEXT_PUBLIC_BACKEND_URL` environment variable to your production backend URL.
