/**
 * Market data for the marketing site.
 *
 * The landing page must never look dead, so it ships with a seed snapshot that
 * mirrors the backend's listing metadata. `useMarkets` upgrades that snapshot to
 * live prices when the API is reachable and quietly keeps the seed when it isn't.
 */

export type Market = {
  symbol: string;
  name: string;
  sector: string;
  region: "US" | "IN";
  currency: "USD" | "INR";
  price: number;
  changePercent: number;
  marketCap: string;
  volume: string;
};

/** Mirrors STOCK_METADATA in backend/src/hyperliquid.ts. */
export const SEED_MARKETS: Market[] = [
  { symbol: "xAAPL", name: "Apple Inc.", sector: "Tech", region: "US", currency: "USD", price: 314.96, changePercent: 1.24, marketCap: "4.82T", volume: "48.2M" },
  { symbol: "xNVDA", name: "NVIDIA Corp.", sector: "Tech", region: "US", currency: "USD", price: 207.4, changePercent: 2.86, marketCap: "5.12T", volume: "210.4M" },
  { symbol: "xTSLA", name: "Tesla Inc.", sector: "Auto", region: "US", currency: "USD", price: 393.99, changePercent: -0.92, marketCap: "1.23T", volume: "92.5M" },
  { symbol: "xMSFT", name: "Microsoft Corp.", sector: "Tech", region: "US", currency: "USD", price: 385.66, changePercent: 0.61, marketCap: "3.24T", volume: "16.2M" },
  { symbol: "xGOOGL", name: "Alphabet Inc.", sector: "Tech", region: "US", currency: "USD", price: 355.89, changePercent: 1.48, marketCap: "2.12T", volume: "22.1M" },
  { symbol: "xAMZN", name: "Amazon.com Inc.", sector: "Tech", region: "US", currency: "USD", price: 185.0, changePercent: 0.37, marketCap: "2.26T", volume: "31.2M" },
  { symbol: "xMETA", name: "Meta Platforms", sector: "Tech", region: "US", currency: "USD", price: 660.31, changePercent: -1.13, marketCap: "1.68T", volume: "12.4M" },
  { symbol: "xJPM", name: "JPMorgan Chase", sector: "Finance", region: "US", currency: "USD", price: 333.23, changePercent: 0.44, marketCap: "964B", volume: "8.5M" },
  { symbol: "xKO", name: "Coca-Cola Co.", sector: "Consumer", region: "US", currency: "USD", price: 82.52, changePercent: 0.18, marketCap: "356B", volume: "12.8M" },
  { symbol: "xINFY", name: "Infosys Ltd.", sector: "Tech", region: "US", currency: "USD", price: 10.94, changePercent: 0.72, marketCap: "45.2B", volume: "4.2M" },
  { symbol: "xRELI", name: "Reliance Industries", sector: "Energy", region: "IN", currency: "INR", price: 1297.0, changePercent: 1.02, marketCap: "10.4T", volume: "9.1M" },
  { symbol: "xTCS", name: "Tata Consultancy", sector: "Tech", region: "IN", currency: "INR", price: 2069.0, changePercent: -0.35, marketCap: "7.6T", volume: "2.8M" },
];

export const SECTORS = ["All", "Tech", "Finance", "Auto", "Energy", "Consumer"] as const;

/** Same INR display conversion the trading app uses. */
const INR_PER_USD = 84.5;

export const formatPrice = (price: number, currency: string) => {
  if (currency === "INR") {
    return "₹" + (price * INR_PER_USD).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  return (
    "$" +
    price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
};

export const formatPercent = (pct: number) =>
  `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

/** Ticker glyph for a symbol — first letter of the underlying, minus the x prefix. */
export const glyph = (symbol: string) => symbol.replace(/^x/, "").slice(0, 1);

export const underlying = (symbol: string) => symbol.replace(/^x/, "");
