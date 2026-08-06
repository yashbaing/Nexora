# ArcMOQ

**Small buyers. Real inventory. One autonomous global order.**

ArcMOQ helps UAE SMEs jointly purchase inventory from global suppliers. An AI procurement agent researches suppliers, negotiates MOQ, and settles on **Circle Arc** in USDC → EURC. After shipment verification, each buyer receives an onchain digital warehouse receipt (ERC-1155) for its allocation.

## Demo use case

Spanish **extra virgin olive oil** (5L tins, Jaén) for UAE restaurants, hotels, grocery, and catering.

| | |
|---|---|
| Original supplier MOQ | 1,000 tins |
| Combined UAE demand | 860 tins |
| Agent outcome | MOQ renegotiated to 860 @ €38.10 / tin, immediate EURC |
| Settlement | USDC pool on Arc → StableFX **Adapter Mode** → EURC to supplier |
| RWA | Batch `EVOO-ES-UAE-001` — 860 receipt units minted after demo verifier attestation |

## What is real vs simulated

| Layer | Label |
|---|---|
| AED bank / local PSP | **Simulated PSP** |
| Arc contracts + settlement | **Live Testnet** (when funded) or local Hardhat |
| Supplier quotes | **Sandbox** |
| StableFX | **Adapter Mode** (not AED→USDC) |
| Warehouse attestation | **Demo Verifier** |

## Stack

- `blockchain/` — Solidity: `GroupOrder`, `WarehouseReceipt` (ERC-1155), `StableFXAdapter`, mocks
- `backend/` — AI agent pipeline (research, match, negotiate, policy) + demo orchestration on Arc/local
- `frontend/` — Next.js product site + 5-screen demo app

## Quick start (local)

```bash
# Terminal 1 — chain
cd blockchain && npm install && npx hardhat node

# Terminal 2 — deploy
cd blockchain && npx hardhat run scripts/deploy.ts --network localhost
cp ../deployed-addresses.json ../backend/

# Terminal 3 — API
cd backend && npm install && npm run dev

# Terminal 4 — UI
cd frontend && npm install && npm run dev
```

Open http://localhost:3000 → **Open demo** → **Run full demo**.

## Arc Testnet

Network: Arc Testnet · Chain ID `5042002` · RPC `https://rpc.testnet.arc.io` · Explorer https://testnet.arcscan.app

```bash
# Fund deployer with USDC (+ EURC for adapter liquidity) from https://faucet.circle.com
cd blockchain
# set PRIVATE_KEY in .env
npx hardhat run scripts/deploy.ts --network arcTestnet
```

Official Arc addresses used when `chainId === 5042002`:

- USDC `0x3600000000000000000000000000000000000000`
- EURC `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

## Pitch

> ArcMOQ helps UAE SMEs buy global inventory together. An AI agent negotiates the order and pays the Spanish supplier in EURC, while each buyer receives an onchain claim for its share of the real goods.

## Core principle

**AI is the execution layer, not the inventory verifier.** Warehouse / custodian attestation is required before receipt minting.
