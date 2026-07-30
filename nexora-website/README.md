# Nexora Marketing Website

A separate marketing and landing site for Nexora, distinct from the trading application.

## Purpose

- **This site** (`nexora-website/`) — public landing page, product overview, Join Waitlist signup, and CTA to launch the app
- **Trading app** (`frontend/`) — wallet-connected trading interface at port 3000

## Quick Start

```bash
# From repo root
npm install
npm run dev:website
```

Open **http://localhost:3001**

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL for "Launch App" / "Start Trading" links |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:5001` | Backend API used by the Join Waitlist form (`/api/waitlist`) |

## Run everything

```bash
npm run dev
```

| Service | Port |
|---------|------|
| Marketing website | 3001 |
| Trading app | 3000 |
| Backend API | 5001 |

## Build

```bash
npm run build --workspace=nexora-website
```
