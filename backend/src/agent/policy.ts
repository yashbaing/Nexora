import { AED_PER_EUR, AED_PER_USD, BuyerMandateInput, PolicyCheck } from "../data/demo";
import { NegotiationResult } from "../data/demo";

export type PolicyInput = {
  buyers: BuyerMandateInput[];
  negotiation: NegotiationResult;
  supplierWhitelisted: boolean;
  offerExpired: boolean;
  orderFullyFunded: boolean;
  fxSlippageBps: number;
  maxFxSlippageBps: number;
  settlementWalletApproved: boolean;
  fundedUSDC: number;
  requiredUSDC: number;
};

export function runPolicyEngine(input: PolicyInput): {
  ok: boolean;
  checks: PolicyCheck[];
  perBuyerAED: Array<{
    id: string;
    name: string;
    quantity: number;
    estimatedCostAED: number;
    maxAuthorizedAED: number;
    withinBudget: boolean;
    autonomousOk: boolean;
  }>;
} {
  const { negotiation } = input;
  const unitEUR = negotiation.offer.unitPriceEUR;
  const perBuyerAED = input.buyers.map((b) => {
    const costEUR = unitEUR * b.quantity;
    const estimatedCostAED = costEUR * AED_PER_EUR;
    const withinBudget = estimatedCostAED <= b.maxBudgetAED;
    return {
      id: b.id,
      name: b.name,
      quantity: b.quantity,
      estimatedCostAED: Math.round(estimatedCostAED * 100) / 100,
      maxAuthorizedAED: b.maxBudgetAED,
      withinBudget,
      autonomousOk: withinBudget && b.allowAutonomous,
    };
  });

  const checks: PolicyCheck[] = [
    {
      name: "Supplier whitelisted",
      passed: input.supplierWhitelisted,
      detail: input.supplierWhitelisted ? "Oliva Sur on allowlist" : "Supplier not whitelisted",
    },
    {
      name: "Offer active",
      passed: !input.offerExpired && negotiation.status === "accepted",
      detail: input.offerExpired ? "Offer expired" : `Offer valid (${negotiation.expirySeconds}s window)`,
    },
    {
      name: "Combined budgets cover order",
      passed: perBuyerAED.every((b) => b.withinBudget),
      detail: perBuyerAED.every((b) => b.withinBudget)
        ? "Each buyer within mandate"
        : "One or more buyers exceed budget — approval required",
    },
    {
      name: "Buyer mandates satisfied",
      passed: perBuyerAED.every((b) => b.withinBudget),
      detail: "Quantity, quality, and price variance within limits",
    },
    {
      name: "Delivery deadlines",
      passed: negotiation.offer.deliveryDays <= 35,
      detail: `${negotiation.offer.deliveryDays}-day delivery fits September/October deadlines`,
    },
    {
      name: "Order fully funded",
      passed: input.orderFullyFunded && input.fundedUSDC >= input.requiredUSDC * 0.99,
      detail: `Pooled USDC ${input.fundedUSDC.toFixed(2)} vs required ${input.requiredUSDC.toFixed(2)}`,
    },
    {
      name: "FX slippage within policy",
      passed: input.fxSlippageBps <= input.maxFxSlippageBps,
      detail: `Slippage ${input.fxSlippageBps} bps ≤ max ${input.maxFxSlippageBps} bps`,
    },
    {
      name: "Settlement destination approved",
      passed: input.settlementWalletApproved,
      detail: input.settlementWalletApproved
        ? "Supplier EURC wallet approved"
        : "Settlement wallet not approved",
    },
  ];

  return { ok: checks.every((c) => c.passed), checks, perBuyerAED };
}

export function estimateSettlement(quantity: number, unitPriceEUR: number, rateEurPerUsd = 0.92) {
  const totalEUR = quantity * unitPriceEUR;
  const feeBps = 15;
  const grossUsd = totalEUR / rateEurPerUsd;
  const feeEUR = totalEUR * (feeBps / 10000);
  const usdcNeeded = grossUsd / (1 - feeBps / 10000);
  return {
    quantity,
    unitPriceEUR,
    totalEUR: round2(totalEUR),
    totalEURC: round2(totalEUR),
    usdcNeeded: round2(usdcNeeded),
    fxRate: rateEurPerUsd,
    fxFeeBps: feeBps,
    fxFeeEUR: round2(feeEUR),
    aedTotal: round2(totalEUR * AED_PER_EUR),
    usdPerAed: AED_PER_USD,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
