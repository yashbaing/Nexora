# Nexora Marketing Website

A separate marketing and landing site for Nexora, distinct from the trading application.

## Purpose

- **This site** (`website/`) — public landing page, product overview, and CTA to launch the app
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

## Run everything

```bash
npm run dev:all
```

| Service | Port |
|---------|------|
| Marketing website | 3001 |
| Trading app | 3000 |
| Backend API | 5001 |

## Build

```bash
npm run build --workspace=website
```
