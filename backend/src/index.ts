import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  getDemoState,
  resetDemo,
  runAggregate,
  runFullDemo,
  runNegotiate,
  runPolicy,
  runRedeem,
  runResearch,
  runSettlement,
  runVerifyAndMint,
} from "./agent/orchestrator";
import { DEMO_BUYERS, SUPPLIERS, AED_PER_EUR } from "./data/demo";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 5001);

function loadAddresses() {
  const candidates = [
    path.join(process.cwd(), "deployed-addresses.json"),
    path.join(process.cwd(), "../deployed-addresses.json"),
    path.join(__dirname, "../../deployed-addresses.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  }
  return {
    network: "arcTestnet",
    chainId: 5042002,
    rpcUrl: "https://rpc.testnet.arc.io",
    explorer: "https://testnet.arcscan.app",
    USDC: "0x3600000000000000000000000000000000000000",
    EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    GroupOrder: null,
    StableFXAdapter: null,
    WarehouseReceipt: null,
    labels: {
      aedCollection: "Simulated PSP",
      arcSettlement: "Pending deploy",
      supplierQuotes: "Sandbox",
      stableFx: "Test or Adapter Mode",
      warehouseAttestation: "Demo Verifier",
    },
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "arcmoq-backend", time: new Date().toISOString() });
});

app.get("/api/config", (_req, res) => {
  res.json({
    product: "ArcMOQ",
    tagline: "Small buyers. Real inventory. One autonomous global order.",
    pitch:
      "ArcMOQ helps UAE SMEs buy global inventory together. An AI agent negotiates the order and pays the Spanish supplier in EURC, while each buyer receives an onchain claim for its share of the real goods.",
    tracks: ["SME Trade Finance", "RWA Tokenization", "Agentic Economy", "Cross-Border Payments"],
    contracts: loadAddresses(),
    fxDisplay: { aedPerEur: AED_PER_EUR },
  });
});

app.get("/api/orders", (_req, res) => {
  const demand = DEMO_BUYERS.reduce((s, b) => s + b.quantity, 0);
  const retailHint = 45; // € retail-ish
  const wholesale = 38.1;
  const savingsPct = Math.round(((retailHint - wholesale) / retailHint) * 1000) / 10;
  res.json({
    orders: [
      {
        id: 1,
        product: "Extra Virgin Olive Oil",
        origin: "Jaén, Spain",
        packaging: "5-liter tins",
        currentDemand: demand,
        supplierMOQ: 1000,
        businesses: DEMO_BUYERS.length,
        estimatedSavingsPct: savingsPct,
        status: "Open",
        batchId: "EVOO-ES-UAE-001",
      },
    ],
  });
});

app.get("/api/buyers", (_req, res) => res.json({ buyers: DEMO_BUYERS }));
app.get("/api/suppliers", (_req, res) => res.json({ suppliers: SUPPLIERS, label: "Sandbox" }));

app.get("/api/agent/state", (_req, res) => res.json(getDemoState()));
app.post("/api/agent/reset", (_req, res) => res.json(resetDemo()));
app.post("/api/agent/aggregate", (_req, res) => res.json(runAggregate()));
app.post("/api/agent/research", (_req, res) => res.json(runResearch()));
app.post("/api/agent/negotiate", (_req, res) => res.json(runNegotiate()));
app.post("/api/agent/policy", (_req, res) => res.json(runPolicy()));
app.post("/api/agent/settle", (req, res) => res.json(runSettlement(req.body?.txHash)));
app.post("/api/agent/mint", (req, res) => res.json(runVerifyAndMint(req.body?.txHash)));
app.post("/api/agent/redeem", (req, res) => {
  try {
    res.json(runRedeem(req.body?.buyer || "Restaurant A", req.body?.quantity || 100, req.body?.txHash));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/agent/run-demo", (_req, res) => res.json(runFullDemo()));

app.post("/api/mandates", (req, res) => {
  const body = req.body || {};
  const mandate = {
    id: `mandate-${Date.now()}`,
    name: body.name || "New UAE Buyer",
    type: body.type || "SME",
    quantity: Number(body.quantity || 100),
    maxBudgetAED: Number(body.maxBudgetAED || 15000),
    quality: body.quality || "Extra Virgin",
    deliveryDeadline: body.deliveryDeadline || "2026-09-30",
    maxPriceVariancePct: Number(body.maxPriceVariancePct || 2),
    allowAutonomous: Boolean(body.allowAutonomous ?? true),
    product: "Extra Virgin Olive Oil",
    packaging: "5-liter tins",
    aedCollection: "Simulated PSP",
  };
  res.status(201).json({ mandate, message: "Mandate recorded (demo). Agent may execute only within these limits." });
});

app.post("/api/documents/extract", (req, res) => {
  // Simulated AI document extraction — not sole attestation authority
  const text = String(req.body?.text || "");
  res.json({
    label: "AI extraction (non-authoritative)",
    extracted: {
      supplier: "Oliva Sur Cooperativa",
      quantity: 860,
      batchId: "EVOO-ES-UAE-001",
      destination: "Jebel Ali, UAE",
      shipmentRef: "BL-ES-UAE-77821",
      product: "Extra Virgin Olive Oil — 5L tins",
      notes: text.slice(0, 120) || "Parsed commercial invoice + packing list + bill of lading fields.",
    },
    warning: "AI extraction alone cannot mint receipts. Demo warehouse verifier attestation is required.",
  });
});

app.get("/api/receipt/:id", (req, res) => {
  const state = getDemoState();
  res.json({
    id: req.params.id,
    batchId: state.rwa?.batchId || "EVOO-ES-UAE-001",
    productName: "Extra Virgin Olive Oil",
    origin: "Jaén, Spain",
    packaging: "5-liter tins",
    supplier: "Oliva Sur Cooperativa",
    warehouse: "Demo Jebel Ali Bonded Warehouse",
    status: state.rwa?.status || "Pending",
    verified: state.rwa?.verified || false,
    allocations: state.rwa?.allocations || [],
    transferPolicy: "KYB-approved businesses only — no public speculative market",
  });
});

resetDemo();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ArcMOQ backend listening on :${PORT}`);
});
