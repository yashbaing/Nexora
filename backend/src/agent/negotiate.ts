import { CounterOffer, NegotiationResult, SupplierQuote } from "../data/demo";

/**
 * Structured negotiation — not free-form chat.
 * Prefers Oliva Sur when demand is close to MOQ and EURC immediate payment is offered.
 */
export function negotiate(
  supplier: SupplierQuote,
  demandQty: number,
  counter: Partial<CounterOffer> = {}
): NegotiationResult {
  const gap = supplier.moq - demandQty;
  const gapPct = gap / supplier.moq;

  // Demo counteroffer for close MOQ gaps: slight premium for reduced MOQ + immediate EURC
  const negotiatedPrice =
    counter.unitPriceEUR ??
    (gap > 0 ? Math.round((supplier.unitPriceEUR + 0.6) * 100) / 100 : supplier.unitPriceEUR);

  const offer: CounterOffer = {
    supplierId: supplier.supplierId,
    quantity: demandQty,
    unitPriceEUR: negotiatedPrice,
    deliveryDays: counter.deliveryDays ?? supplier.deliveryDays,
    paymentCurrency: "EURC",
    paymentTiming: "immediate",
    recurringIntent: counter.recurringIntent ?? "monthly",
  };

  const acceptsReducedMoq =
    supplier.verified &&
    supplier.paymentCurrency === "EURC" &&
    gap > 0 &&
    gapPct <= 0.2 &&
    offer.paymentTiming === "immediate" &&
    offer.unitPriceEUR >= supplier.unitPriceEUR + 0.5 &&
    offer.recurringIntent !== "none";

  if (acceptsReducedMoq) {
    return {
      status: "accepted",
      offer,
      originalMOQ: supplier.moq,
      newMOQ: demandQty,
      expirySeconds: 300,
      message: `${supplier.name} accepted reduced MOQ ${demandQty} at €${offer.unitPriceEUR.toFixed(2)}/tin for immediate EURC + monthly intent.`,
    };
  }

  if (supplier.moq <= demandQty) {
    return {
      status: "accepted",
      offer: { ...offer, unitPriceEUR: supplier.unitPriceEUR, quantity: demandQty },
      originalMOQ: supplier.moq,
      newMOQ: demandQty,
      expirySeconds: 300,
      message: `${supplier.name} accepted order at listed terms.`,
    };
  }

  return {
    status: "rejected",
    offer,
    originalMOQ: supplier.moq,
    newMOQ: supplier.moq,
    expirySeconds: 0,
    message: `${supplier.name} rejected MOQ reduction. Gap too large or incentives insufficient.`,
  };
}

/**
 * Prefer the agentic MOQ-renegotiation moment: verified EURC suppliers whose MOQ is
 * slightly above demand (≤20% gap), then lowest negotiated unit price.
 */
export function pickNegotiationTarget(
  ranked: Array<SupplierQuote & { score: number }>,
  demandQty: number
): SupplierQuote {
  const eurc = ranked.filter((s) => s.paymentCurrency === "EURC" && s.verified);
  const pool = eurc.length ? eurc : ranked;

  const renegotiable = pool.filter((s) => {
    const gap = s.moq - demandQty;
    return gap > 0 && gap / s.moq <= 0.2;
  });

  const candidates = renegotiable.length ? renegotiable : pool;

  return [...candidates].sort((a, b) => {
    // Prefer classic demo target when present
    if (a.supplierId === "oliva-sur") return -1;
    if (b.supplierId === "oliva-sur") return 1;
    const priceA = a.moq > demandQty ? a.unitPriceEUR + 0.6 : a.unitPriceEUR;
    const priceB = b.moq > demandQty ? b.unitPriceEUR + 0.6 : b.unitPriceEUR;
    if (priceA !== priceB) return priceA - priceB;
    return a.deliveryDays - b.deliveryDays;
  })[0];
}
