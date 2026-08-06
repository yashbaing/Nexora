# ArcMOQ

**Small buyers. Real inventory. One autonomous global order.**

ArcMOQ helps UAE SMEs jointly purchase inventory from global suppliers. An AI procurement agent researches suppliers, negotiates MOQ/price with structured offers, pools USDC on Arc, settles the Spanish supplier in EURC, and mints redeemable digital warehouse receipts after shipment verification.

## Demo use case

Spanish extra virgin olive oil (5L tins, Jaén) for UAE restaurants, hotels, grocers, and caterers.

- Original supplier MOQ: **1,000 tins**
- Combined UAE demand: **860 tins**
- Agent negotiates MOQ down to **860** for immediate EURC + monthly intent
- Settlement: AED UX (simulated PSP) → USDC on Arc → StableFX adapter → EURC
- RWA: ERC-1155 warehouse receipts minted only after demo warehouse attestation

## Architecture

```
frontend/     Next.js product site + 5 demo screens
backend/      AI agent orchestrator + policy engine API
blockchain/   GroupOrder, StableFXAdapter, WarehouseReceipt (Arc Testnet)
```

### Smart contracts

| Contract | Role |
|---|---|
| `GroupOrder` | Mandates, USDC funding, offers, policy-gated settlement, refunds |
| `StableFXAdapter` | Labeled **Test or Adapter Mode** USDC→EURC conversion |
| `WarehouseReceipt` | ERC-1155 receipts, KYB transfer restrictions, redeem/burn |

### Agent components

1. **Supplier Research** — structured comparison of sandbox suppliers  
2. **Demand Matching** — compatible mandate aggregation  
3. **Negotiation** — structured counteroffers (not free-form chat)  
4. **Execution Policy Engine** — deterministic checks before any chain tx  

AI is the execution layer, **not** the sole asset verifier. Minting requires a trusted attestation signer.

## Quick start

```bash
# Install
npm run install-all

# Terminal A — contracts (optional local chain)
cd blockchain && npx hardhat node

# Terminal B — deploy local
cd blockchain && npm run deploy:local

# Terminal C — API + site
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5001  
- Demo app: http://localhost:3000/app  

## Arc Testnet

| Parameter | Value |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.io` |
| Explorer | https://testnet.arcscan.app |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| Faucet | https://faucet.circle.com |

```bash
cd blockchain
cp .env.example .env   # set ARC_PRIVATE_KEY
# Fund wallet with USDC + EURC from Circle faucet
npm run deploy:arc
```

Generated deployer for this environment (needs faucet funding):

`0xf944B3ECC9f4fB7809aC01aA80348321B666e707`

Addresses are written to `deployed-addresses.json`.

## What is real vs simulated

| Label | Mode |
|---|---|
| Arc Settlement | Live Testnet (when deployed) |
| StableFX | Test or Adapter Mode |
| AED Collection | Simulated PSP |
| Supplier Quotes | Sandbox |
| Warehouse Attestation | Demo Verifier |

**Does not claim** that StableFX converts AED into USDC.

## Pitch

> ArcMOQ helps UAE SMEs buy global inventory together. An AI agent negotiates the order and pays the Spanish supplier in EURC, while each buyer receives an onchain claim for its share of the real goods.

## License

MIT
