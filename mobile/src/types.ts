export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  currency: string;
  region: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  dayHigh: number;
  dayLow: number;
};

export type Holding = {
  symbol: string;
  qty: number;
  avgPrice: number;
};

export type Portfolio = {
  cash: number;
  holdings: Holding[];
};
