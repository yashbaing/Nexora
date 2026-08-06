import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import {
  BUYERS_DEMO,
  SUPPLIERS_SANDBOX,
  AED_PER_USD,
  estimateBuyerAED,
  matchDemand,
  researchSuppliers,
  negotiate,
  getEvents,
  resetEvents,
  policyValidate,
} from "./agent";
import { runFullDemo, getDemoState, redeemRestaurantA, getConfigPublic } from "./demo";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 5001);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ArcMOQ", time: new Date().toISOString() });
});

app.get("/api/config", (_req, res) => {
  try {
    res.json(getConfigPublic());
  } catch (e: any) {
    res.status(503).json({ error: e.message });
  }
});

app.get("/deployed-addresses.json", (_req, res) => {
  try {
    res.json(getConfigPublic());
  } catch (e: any) {
    res.status(503).json({ error: e.message });
  }
});

app.get("/api/product", (_req, res) => {
  res.json({
    name: "Extra Virgin Olive Oil",
    origin: "Jaén, Spain",
    packaging: "5-liter tins",
    originalMOQ: 1000,
    currentDemand: 860,
    invoiceCurrency: "EUR",
    settlementCurrency: "EURC",
    tagline: "Small buyers. Real inventory. One autonomous global order.",
  });
});

app.get("/api/buyers", (_req, res) => {
  res.json(
    BUYERS_DEMO.map((b) => ({
      ...b,
      maxUSDC: Number((b.maxAED / AED_PER_USD).toFixed(2)),
      estimate: estimateBuyerAED(b.quantity, 38.1),
    }))
  );
});

app.get("/api/suppliers", (_req, res) => {
  res.json({ label: "Supplier Quotes: Sandbox", suppliers: SUPPLIERS_SANDBOX });
});

app.get("/api/agent/events", (_req, res) => {
  res.json(getEvents());
});

app.post("/api/agent/research", (_req, res) => {
  resetEvents();
  const demand = matchDemand();
  const ranked = researchSuppliers(demand.totalDemand);
  const nego = negotiate(demand.totalDemand, ranked);
  res.json({ demand, ranked, negotiation: nego, events: getEvents() });
});

app.post("/api/agent/policy-preview", (req, res) => {
  const body = req.body || {};
  const result = policyValidate({
    supplierWhitelisted: body.supplierWhitelisted ?? true,
    offerExpired: body.offerExpired ?? false,
    totalFundedUSDC: body.totalFundedUSDC ?? 36000,
    requiredUSDC: body.requiredUSDC ?? 33000,
    buyersWithinMandate: body.buyersWithinMandate ?? true,
    deliveryOk: body.deliveryOk ?? true,
    fxSlippageBps: body.fxSlippageBps ?? 10,
    maxSlippageBps: body.maxSlippageBps ?? 200,
    destinationApproved: body.destinationApproved ?? true,
  });
  res.json(result);
});

app.get("/api/demo/state", (_req, res) => {
  res.json(getDemoState());
});

app.post("/api/demo/run", async (_req, res) => {
  try {
    const state = await runFullDemo();
    res.json(state);
  } catch (e: any) {
    res.status(500).json({ error: e.message, state: getDemoState() });
  }
});

app.post("/api/demo/redeem", async (req, res) => {
  try {
    const quantity = Number(req.body?.quantity || 100);
    const result = await redeemRestaurantA(quantity);
    res.json({ ...result, events: getEvents(), state: getDemoState() });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/orders/active", (_req, res) => {
  const state = getDemoState();
  res.json([
    {
      id: state.orderId || 1,
      product: "Extra Virgin Olive Oil",
      origin: "Jaén, Spain",
      packaging: "5-liter tins",
      currentDemand: 860,
      originalMOQ: 1000,
      businesses: 5,
      estimatedSavingsPct: 18,
      status: state.status === "complete" ? "Settled" : state.status === "running" ? "Negotiating" : "Open",
      settlement: state.settlement,
      receipt: state.receipt,
    },
  ]);
});

// Static fallback for addresses file from monorepo root
app.use("/artifacts", express.static(path.join(__dirname, "..", "..")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ArcMOQ API on :${PORT}`);
});
