import { BUYERS_DEMO, SUPPLIERS_SANDBOX, AED_PER_USD, aedToUsdc, usdcToAed } from "./config";

export type AgentEvent = {
  id: string;
  at: string;
  type: string;
  title: string;
  detail: string;
  meta?: Record<string, unknown>;
};

export type CounterOffer = {
  supplierId: string;
  quantity: number;
  unitPriceEUR: number;
  deliveryDays: number;
  paymentCurrency: "EURC" | "USDC";
  paymentTiming: "immediate";
  recurringIntent: "monthly" | "none";
};

export type NegotiationResult = {
  target: (typeof SUPPLIERS_SANDBOX)[number];
  counterOffer: CounterOffer;
  accepted: boolean;
  response: {
    status: "Accepted" | "Rejected";
    newMOQ: number;
    unitPriceEUR: number;
    offerExpirySeconds: number;
  };
};

let events: AgentEvent[] = [];

export function push(type: string, title: string, detail: string, meta?: Record<string, unknown>) {
  const ev: AgentEvent = {
    id: `evt_${events.length + 1}`,
    at: new Date().toISOString(),
    type,
    title,
    detail,
    meta,
  };
  events.push(ev);
  return ev;
}

export function getEvents() {
  return events;
}

export function resetEvents() {
  events = [];
}

/** Demand Matching Agent */
export function matchDemand() {
  const total = BUYERS_DEMO.reduce((s, b) => s + b.quantity, 0);
  const compatible = BUYERS_DEMO.every(
    (b) => b.quality === "Extra Virgin" && b.maxAED / b.quantity > 100
  );
  push(
    "demand",
    "Aggregated UAE buyer demand",
    `${BUYERS_DEMO.length} compatible mandates combined for ${total} tins of Extra Virgin Olive Oil.`,
    { buyers: BUYERS_DEMO, total, compatible }
  );
  return { buyers: BUYERS_DEMO, totalDemand: total, compatible };
}

/** Supplier Research Agent */
export function researchSuppliers(demandQty: number) {
  const fxRate = 1.0; // Adapter Mode near-parity for demo clarity
  const ranked = SUPPLIERS_SANDBOX.map((s) => {
    const totalEUR = s.priceEUR * Math.max(demandQty, s.moq);
    const usdcEstimate = totalEUR / fxRate;
    const aedEstimate = usdcToAed(usdcEstimate);
    const moqGap = Math.max(0, s.moq - demandQty);
    const score =
      100 -
      s.priceEUR * 0.8 -
      moqGap * 0.05 -
      s.deliveryDays * 0.15 -
      (s.acceptsEURC ? 0 : 8);
    return { ...s, totalEUR, usdcEstimate, aedEstimate, moqGap, score };
  }).sort((a, b) => b.score - a.score);

  push(
    "research",
    "Compared three Spanish suppliers",
    ranked
      .map(
        (s) =>
          `${s.name}: €${s.priceEUR}/tin · MOQ ${s.moq} · ${s.deliveryDays}d · ${s.acceptsEURC ? "EURC" : "USDC"}`
      )
      .join(" · "),
    { suppliers: ranked }
  );
  return ranked;
}

/** Negotiation Agent — structured counteroffers, not free chat */
export function negotiate(demandQty: number, ranked: ReturnType<typeof researchSuppliers>): NegotiationResult {
  // Prefer EURC suppliers closest to demand; Oliva Sur is best negotiation target (MOQ gap, good price, EURC)
  const target =
    ranked.find((s) => s.id === "oliva-sur") ||
    ranked.find((s) => s.acceptsEURC && s.moqGap > 0) ||
    ranked[0];

  push(
    "negotiate",
    `Selected ${target.name} for negotiation`,
    `Original MOQ ${target.moq} exceeds combined demand ${demandQty}. Proposing immediate EURC settlement + recurring monthly intent.`,
    { supplierId: target.id, originalMOQ: target.moq, demandQty }
  );

  const counterOffer: CounterOffer = {
    supplierId: target.id,
    quantity: demandQty,
    unitPriceEUR: 38.1,
    deliveryDays: target.deliveryDays,
    paymentCurrency: "EURC",
    paymentTiming: "immediate",
    recurringIntent: "monthly",
  };

  push(
    "negotiate",
    "Submitted structured counteroffer",
    `Qty ${counterOffer.quantity} · €${counterOffer.unitPriceEUR}/tin · ${counterOffer.paymentCurrency} immediate · recurring ${counterOffer.recurringIntent}`,
    { counterOffer }
  );

  // Sandbox supplier acceptance rule: accept if price >= list-2% and immediate EURC + recurring
  const minAccept = target.priceEUR * 0.98;
  const accepted =
    counterOffer.unitPriceEUR >= minAccept &&
    counterOffer.paymentCurrency === "EURC" &&
    counterOffer.paymentTiming === "immediate" &&
    target.acceptsEURC;

  const response = accepted
    ? {
        status: "Accepted" as const,
        newMOQ: demandQty,
        unitPriceEUR: counterOffer.unitPriceEUR,
        offerExpirySeconds: 300,
      }
    : {
        status: "Rejected" as const,
        newMOQ: target.moq,
        unitPriceEUR: target.priceEUR,
        offerExpirySeconds: 0,
      };

  push(
    accepted ? "negotiate_success" : "negotiate_fail",
    accepted ? "MOQ Renegotiated — supplier accepted" : "Supplier rejected counteroffer",
    accepted
      ? `New MOQ ${response.newMOQ} tins at €${response.unitPriceEUR}. Offer expires in ${response.offerExpirySeconds}s.`
      : "Counteroffer outside supplier policy.",
    { response, counterOffer }
  );

  return { target, counterOffer, accepted, response };
}

/** Execution Policy Engine — deterministic */
export function policyValidate(input: {
  supplierWhitelisted: boolean;
  offerExpired: boolean;
  totalFundedUSDC: number;
  requiredUSDC: number;
  buyersWithinMandate: boolean;
  deliveryOk: boolean;
  fxSlippageBps: number;
  maxSlippageBps: number;
  destinationApproved: boolean;
}) {
  const checks = [
    { key: "supplier_whitelisted", ok: input.supplierWhitelisted, label: "Supplier whitelisted" },
    { key: "offer_active", ok: !input.offerExpired, label: "Offer not expired" },
    { key: "fully_funded", ok: input.totalFundedUSDC >= input.requiredUSDC, label: "Order fully funded" },
    { key: "mandates", ok: input.buyersWithinMandate, label: "Each buyer within mandate" },
    { key: "delivery", ok: input.deliveryOk, label: "Delivery meets deadlines" },
    { key: "fx_slippage", ok: input.fxSlippageBps <= input.maxSlippageBps, label: "FX slippage within policy" },
    { key: "destination", ok: input.destinationApproved, label: "Settlement destination approved" },
  ];
  const ok = checks.every((c) => c.ok);
  push(
    "policy",
    ok ? "Policy checks passed" : "Policy checks failed — execution blocked",
    checks.map((c) => `${c.ok ? "✓" : "✗"} ${c.label}`).join(" · "),
    { checks, ok }
  );
  return { ok, checks };
}

export function estimateBuyerAED(quantity: number, unitEUR: number, fxRate = 0.92) {
  const eur = quantity * unitEUR;
  const usdc = eur / fxRate;
  const aed = usdcToAed(usdc);
  return { eur, usdc, aed };
}

export { BUYERS_DEMO, SUPPLIERS_SANDBOX, AED_PER_USD, aedToUsdc, usdcToAed };
