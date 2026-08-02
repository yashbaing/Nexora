import axios from "axios";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "./config";
import type { Portfolio, Stock } from "./types";

export const api = axios.create({ baseURL: BACKEND_URL, timeout: 20000 });

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export async function fetchStocks(): Promise<Stock[]> {
  const { data } = await api.get("/api/stocks");
  return data;
}

export async function fetchPortfolio(): Promise<Portfolio> {
  const { data } = await api.get("/api/portfolio");
  return {
    cash: Number(data.cash ?? data.usdc ?? 0),
    holdings: (data.holdings || []).map((h: any) => ({
      symbol: h.symbol,
      qty: Number(h.qty),
      avgPrice: Number(h.avg_price ?? h.avgPrice ?? 0),
    })),
  };
}

export async function requestQuote(symbol: string, qty: string, side: "buy" | "sell") {
  const { data } = await api.post("/api/trades/quote", { symbol, qty, side });
  return data as {
    contractQty: string;
    contractPrice: string;
    deadline: number;
    signature: string;
  };
}

export async function syncTrade(txHash: string) {
  const { data } = await api.post("/api/trades/sync", { txHash });
  return data;
}

export function connectPriceSocket(onPrices: (stocks: Stock[]) => void): Socket {
  const socket = io(BACKEND_URL, { transports: ["websocket"], autoConnect: true });
  socket.on("prices_update", (payload: Stock[] | { stocks: Stock[] }) => {
    const list = Array.isArray(payload) ? payload : payload.stocks;
    if (list?.length) onPrices(list);
  });
  return socket;
}
