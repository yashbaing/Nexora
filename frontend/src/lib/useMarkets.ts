"use client";

import { useEffect, useRef, useState } from "react";
import { SEED_MARKETS, type Market } from "./markets";

type State = {
  markets: Market[];
  live: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

/**
 * Prices for the marketing surfaces.
 *
 * Tries the public /api/stocks endpoint once, then polls it. If the backend is
 * unreachable the seed snapshot is used instead and `live` stays false, so the
 * UI can label the numbers honestly rather than pretending they're streaming.
 */
export function useMarkets(pollMs = 12_000): State {
  const [state, setState] = useState<State>({ markets: SEED_MARKETS, live: false });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const load = async () => {
      try {
        const controller = new AbortController();
        const kill = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE}/api/stocks`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(kill);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: unknown = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("empty payload");

        const bySymbol = new Map<string, Record<string, unknown>>();
        for (const row of data as Record<string, unknown>[]) {
          if (typeof row?.symbol === "string") bySymbol.set(row.symbol, row);
        }

        // Keep the seed ordering and copy so a partial API response can't blank the grid.
        const merged = SEED_MARKETS.map((seed) => {
          const live = bySymbol.get(seed.symbol);
          if (!live) return seed;
          const price = Number(live.price);
          const changePercent = Number(live.changePercent);
          return {
            ...seed,
            price: Number.isFinite(price) && price > 0 ? price : seed.price,
            changePercent: Number.isFinite(changePercent) ? changePercent : seed.changePercent,
          };
        });

        if (mounted.current) setState({ markets: merged, live: true });
      } catch {
        if (mounted.current) setState((prev) => (prev.live ? prev : { markets: SEED_MARKETS, live: false }));
      }
    };

    void load();
    const timer = setInterval(load, pollMs);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [pollMs]);

  return state;
}
