export type SupplierQuote = {
  supplierId: string;
  name: string;
  country: string;
  unitPriceEUR: number;
  moq: number;
  deliveryDays: number;
  paymentCurrency: "EURC" | "USDC";
  verified: boolean;
  quality: string;
  notes?: string;
};

export type BuyerMandateInput = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  maxBudgetAED: number;
  quality: string;
  deliveryDeadline: string;
  maxPriceVariancePct: number;
  allowAutonomous: boolean;
  wallet?: string;
};

export type CounterOffer = {
  supplierId: string;
  quantity: number;
  unitPriceEUR: number;
  deliveryDays: number;
  paymentCurrency: "EURC" | "USDC";
  paymentTiming: "immediate" | "net30";
  recurringIntent: "none" | "monthly" | "quarterly";
};

export type NegotiationResult = {
  status: "accepted" | "rejected" | "countered";
  offer: CounterOffer;
  originalMOQ: number;
  newMOQ: number;
  expirySeconds: number;
  message: string;
};

export type PolicyCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export const SUPPLIERS: SupplierQuote[] = [
  {
    supplierId: "oliva-sur",
    name: "Oliva Sur Cooperativa",
    country: "Spain",
    unitPriceEUR: 37.5,
    moq: 1000,
    deliveryDays: 30,
    paymentCurrency: "EURC",
    verified: true,
    quality: "Extra Virgin",
    notes: "Jaén PDO, accepts immediate EURC",
  },
  {
    supplierId: "andalus-gold",
    name: "Andalus Gold Oils",
    country: "Spain",
    unitPriceEUR: 39.2,
    moq: 800,
    deliveryDays: 21,
    paymentCurrency: "EURC",
    verified: true,
    quality: "Extra Virgin",
  },
  {
    supplierId: "med-harvest",
    name: "MedHarvest Export",
    country: "Spain",
    unitPriceEUR: 36.8,
    moq: 1200,
    deliveryDays: 40,
    paymentCurrency: "USDC",
    verified: true,
    quality: "Extra Virgin",
  },
];

export const DEMO_BUYERS: BuyerMandateInput[] = [
  {
    id: "restaurant-a",
    name: "Restaurant A",
    type: "Restaurant",
    quantity: 100,
    maxBudgetAED: 15000,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-09-30",
    maxPriceVariancePct: 2,
    allowAutonomous: true,
  },
  {
    id: "restaurant-b",
    name: "Restaurant B",
    type: "Restaurant",
    quantity: 180,
    maxBudgetAED: 27000,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-09-30",
    maxPriceVariancePct: 2,
    allowAutonomous: true,
  },
  {
    id: "hotel-c",
    name: "Hotel C",
    type: "Hotel",
    quantity: 250,
    maxBudgetAED: 38000,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-10-15",
    maxPriceVariancePct: 3,
    allowAutonomous: true,
  },
  {
    id: "grocery-d",
    name: "Grocery D",
    type: "Grocery",
    quantity: 130,
    maxBudgetAED: 19500,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-09-30",
    maxPriceVariancePct: 2,
    allowAutonomous: true,
  },
  {
    id: "catering-e",
    name: "Catering Company E",
    type: "Catering",
    quantity: 200,
    maxBudgetAED: 30000,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-10-01",
    maxPriceVariancePct: 2,
    allowAutonomous: true,
  },
];

/** Approximate AED per EUR for buyer-facing display (conceptual FX, not StableFX). */
export const AED_PER_EUR = 3.7;
export const AED_PER_USD = 3.6725;
