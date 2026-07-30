# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
Nexora is a Web3 platform for trading tokenized equities (xAAPL, xTSLA, ...). The active app lives in three folders:

- `frontend/` — Next.js 16 + React 19 dev server on `http://localhost:3000` (`npm run dev:frontend`). Proxies `/api/*` and `/deployed-addresses.json` to the backend (see `frontend/next.config.ts`).
- `backend/` — Express + TypeScript (tsx) API + Socket.io on `http://localhost:5001` (`npm run dev:backend`). Signs EIP-712 trade quotes and syncs on-chain trades.
- `blockchain/` — Hardhat + Solidity contracts. Not part of the npm workspaces; its deps install separately.

`frontend_old/` is a legacy Vite/Capacitor app and is NOT wired into the root workspaces — ignore it unless explicitly asked.

The root `README.md` is stale (it describes an old Vite/React 18 app, port 5000, MongoDB, email/password auth). Trust this file and `package.json` scripts instead: the real stack is Next.js + Express/TS + PostgreSQL + Hardhat/Avalanche.

### Running the app
- `npm run dev` (repo root) runs backend + frontend together via `concurrently`. Or run `npm run dev:backend` / `npm run dev:frontend` separately.
- Standard scripts: frontend lint = `npm run lint --workspace=frontend`; contracts = `cd blockchain && npx hardhat compile|test`.

### PostgreSQL (required — backend exits on DB failure)
The backend calls `initDb()` on startup and `process.exit(1)` if PostgreSQL is unreachable. PostgreSQL 16 is installed in the snapshot but the cluster is not always running after a fresh boot — start it before the backend:

```
sudo pg_ctlcluster 16 main start
```

Local DB connection is provided via `backend/.env` (gitignored, persisted in the snapshot): `DATABASE_URL=postgresql://nexora:nexora@localhost:5432/nexora`. The `nexora` role/database already exist in the cluster; the backend auto-creates all tables (`users`, `waitlist`, `portfolios`, etc.) on startup. If `backend/.env` is ever missing, recreate it with `DATABASE_URL` plus `RPC_URL` and `ORACLE_PRIVATE_KEY` from `railway-env-template.txt`.

### On-chain trading + prices (need outbound internet)
Contracts are already deployed to Avalanche Fuji testnet (chain 43113); addresses live in `deployed-addresses.json`. `backend/.env` sets `RPC_URL` (Fuji public RPC) and `ORACLE_PRIVATE_KEY` (must match the on-chain `OracleSigner`) so trade-quote signing works. Live prices come from the Hyperliquid API/WebSocket; if it is unreachable the backend falls back to static prices. No local blockchain node is needed for the deployed-on-Fuji path (`start.sh`/`start-hardhat-node.sh` are only for a local Hardhat chain).

### Notes
- `npm run lint --workspace=frontend` currently reports pre-existing errors/warnings (mostly `no-explicit-any`). These are code-quality issues in the committed source, not an environment problem.
- Quick smoke test of the full stack: `curl -X POST http://localhost:3000/api/waitlist -H 'Content-Type: application/json' -d '{"email":"you@example.com"}'` should return a JSON success message (frontend proxy → backend → PostgreSQL).
