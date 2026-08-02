import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { connectPriceSocket, fetchPortfolio, fetchStocks } from "./api";
import { useWallet } from "./WalletContext";
import type { Portfolio, Stock } from "./types";

type MarketCtx = {
  stocks: Stock[];
  portfolio: Portfolio;
  loading: boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<MarketCtx | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: 0, holdings: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchStocks();
      setStocks(list);
      if (isConnected) {
        const p = await fetchPortfolio();
        setPortfolio(p);
      }
    } catch (e) {
      console.warn("refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    refresh();
    const socket = connectPriceSocket((list) => setStocks(list));
    return () => {
      socket.disconnect();
    };
  }, [refresh]);

  useEffect(() => {
    if (isConnected) refresh();
  }, [isConnected, refresh]);

  const value = useMemo(
    () => ({ stocks, portfolio, loading, refresh }),
    [stocks, portfolio, loading, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMarket() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
