import { DEMO_BUYERS, SUPPLIERS } from "../data/demo";
import { matchDemand, researchSuppliers } from "./research";
import { negotiate, pickNegotiationTarget } from "./negotiate";
import { estimateSettlement, runPolicyEngine } from "./policy";

export type AgentEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "research" | "match" | "negotiate" | "policy" | "settlement" | "rwa" | "system";
};

export type DemoState = {
  step: number;
  events: AgentEvent[];
  demand: ReturnType<typeof matchDemand> | null;
  suppliers: ReturnType<typeof researchSuppliers> | null;
  negotiation: ReturnType<typeof negotiate> | null;
  policy: ReturnType<typeof runPolicyEngine> | null;
  settlement: ReturnType<typeof estimateSettlement> | null;
  rwa: {
    batchId: string;
    status: string;
    verified: boolean;
    attestation: string;
    shipmentRef: string;
    allocations: Array<{ buyer: string; quantity: number; redeemed: number }>;
  } | null;
  labels: Record<string, string>;
  tx: {
    funding?: string[];
    acceptOffer?: string;
    settlement?: string;
    mint?: string;
    redeem?: string;
  };
};

const labels = {
  aedCollection: "Simulated PSP",
  arcSettlement: "Live Testnet / Local",
  supplierQuotes: "Sandbox",
  stableFx: "Test or Adapter Mode",
  warehouseAttestation: "Demo Verifier",
};

let state: DemoState = freshState();

function freshState(): DemoState {
  return {
    step: 0,
    events: [],
    demand: null,
    suppliers: null,
    negotiation: null,
    policy: null,
    settlement: null,
    rwa: null,
    labels,
    tx: {},
  };
}

function push(title: string, detail: string, kind: AgentEvent["kind"]) {
  state.events.push({
    id: `evt-${state.events.length + 1}`,
    at: new Date().toISOString(),
    title,
    detail,
    kind,
  });
}

export function getDemoState() {
  return state;
}

export function resetDemo() {
  state = freshState();
  push("Demo reset", "Ready for ArcMOQ olive-oil group order walkthrough.", "system");
  return state;
}

export function runAggregate() {
  state.demand = matchDemand(DEMO_BUYERS);
  state.step = Math.max(state.step, 1);
  push(
    "Aggregated UAE demand",
    `${state.demand.totalDemand} tins across ${state.demand.buyers.length} businesses (original supplier MOQ 1,000).`,
    "match"
  );
  return state;
}

export function runResearch() {
  if (!state.demand) runAggregate();
  state.suppliers = researchSuppliers(SUPPLIERS, state.demand!.totalDemand);
  state.step = Math.max(state.step, 2);
  push(
    "Compared three suppliers",
    state.suppliers
      .map((s) => `${s.name}: €${s.unitPriceEUR}/tin, MOQ ${s.moq}, ${s.deliveryDays}d, ${s.paymentCurrency}`)
      .join(" · "),
    "research"
  );
  return state;
}

export function runNegotiate() {
  if (!state.suppliers) runResearch();
  const demand = state.demand!.totalDemand;
  const target = pickNegotiationTarget(state.suppliers!, demand);
  push(
    "Selected supplier for negotiation",
    `${target.name} — closest negotiable MOQ gap with EURC settlement.`,
    "negotiate"
  );
  state.negotiation = negotiate(target, demand, {
    unitPriceEUR: 38.1,
    recurringIntent: "monthly",
  });
  state.settlement = estimateSettlement(demand, state.negotiation.offer.unitPriceEUR);
  state.step = Math.max(state.step, 3);
  if (state.negotiation.status === "accepted") {
    push(
      "Supplier accepted reduced MOQ",
      `MOQ ${state.negotiation.originalMOQ} → ${state.negotiation.newMOQ} at €${state.negotiation.offer.unitPriceEUR}/tin, immediate EURC. Offer expires in ${state.negotiation.expirySeconds}s.`,
      "negotiate"
    );
  } else {
    push("Negotiation failed", state.negotiation.message, "negotiate");
  }
  return state;
}

export function runPolicy(overrides: Partial<{
  fundedUSDC: number;
  fxSlippageBps: number;
}> = {}) {
  if (!state.negotiation) runNegotiate();
  const settlement = state.settlement!;
  state.policy = runPolicyEngine({
    buyers: state.demand!.buyers,
    negotiation: state.negotiation!,
    supplierWhitelisted: true,
    offerExpired: false,
    orderFullyFunded: true,
    fxSlippageBps: overrides.fxSlippageBps ?? 12,
    maxFxSlippageBps: 50,
    settlementWalletApproved: true,
    fundedUSDC: overrides.fundedUSDC ?? settlement.usdcNeeded * 1.02,
    requiredUSDC: settlement.usdcNeeded,
  });
  state.step = Math.max(state.step, 4);
  push(
    "Verified buyer budgets & policy",
    state.policy.ok
      ? "All deterministic checks passed. Agent may execute within mandate limits."
      : "Policy blocked execution — see failed checks.",
    "policy"
  );
  push("Requested FX quote", `StableFX adapter mode: ${settlement.usdcNeeded} USDC → ${settlement.totalEURC} EURC @ ${settlement.fxRate} (−${settlement.fxFeeBps} bps fee).`, "settlement");
  return state;
}

export function runSettlement(txHash?: string) {
  if (!state.policy) runPolicy();
  if (!state.policy!.ok) {
    push("Settlement blocked", "Policy engine refused autonomous execution.", "settlement");
    return state;
  }
  state.step = Math.max(state.step, 5);
  if (txHash) state.tx.settlement = txHash;
  push(
    "Executed supplier settlement",
    `USDC pool → EURC via StableFX adapter → supplier paid. ${state.settlement!.totalEURC} EURC to Oliva Sur.`,
    "settlement"
  );
  state.rwa = {
    batchId: "EVOO-ES-UAE-001",
    status: "Supplier Paid — Pending Shipment Verification",
    verified: false,
    attestation: "",
    shipmentRef: "",
    allocations: state.demand!.buyers.map((b) => ({
      buyer: b.name,
      quantity: b.quantity,
      redeemed: 0,
    })),
  };
  return state;
}

export function runVerifyAndMint(txHash?: string) {
  if (!state.rwa) runSettlement();
  if (!state.rwa?.allocations?.length) {
    push(
      "Mint blocked",
      "Settlement did not complete — cannot mint receipts without a paid allocation.",
      "rwa"
    );
    return state;
  }
  state.rwa = {
    ...state.rwa,
    status: "Verified — Receipts Minted",
    verified: true,
    attestation: "attestation:warehouse-demo:bol+packing+invoice",
    shipmentRef: "BL-ES-UAE-77821",
  };
  state.step = Math.max(state.step, 6);
  if (txHash) state.tx.mint = txHash;
  push(
    "Warehouse attestation verified",
    "Demo verifier signed shipment. AI extracted fields but was not the sole authority.",
    "rwa"
  );
  push(
    "Minted warehouse receipts",
    `860 ERC-1155 units allocated across ${state.rwa.allocations.length} KYB-approved buyers.`,
    "rwa"
  );
  return state;
}

export function runRedeem(buyerName = "Restaurant A", qty = 100, txHash?: string) {
  if (!state.rwa?.verified) runVerifyAndMint();
  const alloc = state.rwa!.allocations.find((a) => a.buyer === buyerName);
  if (!alloc) throw new Error("Buyer allocation not found");
  if (alloc.redeemed + qty > alloc.quantity) throw new Error("Insufficient receipt units");
  alloc.redeemed += qty;
  state.step = Math.max(state.step, 7);
  if (txHash) state.tx.redeem = txHash;
  push(
    "Redemption confirmed",
    `${qty} receipt units burned → ${qty} physical 5L tins released to ${buyerName}.`,
    "rwa"
  );
  return state;
}

export function runFullDemo() {
  resetDemo();
  runAggregate();
  runResearch();
  runNegotiate();
  runPolicy();
  runSettlement();
  runVerifyAndMint();
  return state;
}
