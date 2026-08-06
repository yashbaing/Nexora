import { BuyerMandateInput, SupplierQuote, SUPPLIERS } from "../data/demo";

export type SupplierScore = SupplierQuote & {
  score: number;
  totalEUR: number;
  fxFriction: number;
  meetsMOQ: boolean;
  reasons: string[];
};

export function researchSuppliers(
  suppliers: SupplierQuote[] = SUPPLIERS,
  demandQty: number
): SupplierScore[] {
  return suppliers
    .map((s) => {
      const reasons: string[] = [];
      const fxFriction = s.paymentCurrency === "EURC" ? 0 : 0.4;
      const totalEUR = s.unitPriceEUR * Math.max(demandQty, s.moq);
      let score = 100;
      score -= s.unitPriceEUR; // cheaper better
      score -= s.deliveryDays * 0.15;
      score -= fxFriction * 10;
      if (!s.verified) {
        score -= 30;
        reasons.push("Unverified supplier");
      } else {
        reasons.push("Verified supplier");
      }
      const meetsMOQ = demandQty >= s.moq;
      if (!meetsMOQ) {
        score -= 8;
        reasons.push(`MOQ gap: need ${s.moq - demandQty} more tins (negotiable)`);
      } else {
        reasons.push("Demand meets MOQ");
      }
      if (s.paymentCurrency === "EURC") reasons.push("Accepts EURC settlement");
      else reasons.push("USDC only — higher FX friction for ES supplier");
      return { ...s, score, totalEUR, fxFriction, meetsMOQ, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function matchDemand(buyers: BuyerMandateInput[]) {
  const quality = "Extra Virgin";
  const compatible = buyers.filter(
    (b) =>
      b.quality === quality &&
      b.maxPriceVariancePct <= 5 &&
      new Date(b.deliveryDeadline).getTime() >= Date.parse("2026-09-30")
  );
  const totalDemand = compatible.reduce((s, b) => s + b.quantity, 0);
  const totalBudgetAED = compatible.reduce((s, b) => s + b.maxBudgetAED, 0);
  return {
    product: "Extra Virgin Olive Oil",
    packaging: "5-liter tins",
    origin: "Jaén, Spain",
    buyers: compatible,
    totalDemand,
    totalBudgetAED,
    compatible: compatible.length === buyers.length,
    notes:
      compatible.length === buyers.length
        ? "All mandates share product, packaging, quality, and compatible deadlines."
        : "Some mandates excluded due to incompatible requirements.",
  };
}
