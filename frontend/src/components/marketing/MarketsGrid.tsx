"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { SECTORS, formatPercent, formatPrice, underlying, type Market } from "@/lib/markets";
import { useMarkets } from "@/lib/useMarkets";
import { site } from "@/lib/site";

function MarketCard({ market }: { market: Market }) {
  const up = market.changePercent >= 0;

  return (
    <a
      href={site.appPath}
      className="glass glass-hover group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 font-mono text-[13px] font-semibold text-chalk">
        {underlying(market.symbol).slice(0, 2)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="font-mono text-[13.5px] font-semibold text-chalk">{market.symbol}</span>
          <span className="rounded border border-white/8 px-1.5 py-px text-[10px] tracking-wide text-smoke uppercase">
            {market.region}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-smoke">{market.name}</span>
      </span>

      <span className="shrink-0 text-right">
        <span className="tabular block text-[14.5px] font-medium text-chalk">
          {formatPrice(market.price, market.currency)}
        </span>
        <span
          className={`tabular mt-0.5 flex items-center justify-end gap-0.5 text-[12px] font-medium ${
            up ? "text-mint" : "text-crimson"
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {formatPercent(market.changePercent)}
        </span>
      </span>
    </a>
  );
}

/** Compact grid for the landing page. */
export function MarketsPreview({ limit = 6 }: { limit?: number }) {
  const { markets } = useMarkets();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {markets.slice(0, limit).map((m) => (
        <MarketCard key={m.symbol} market={m} />
      ))}
    </div>
  );
}

/** Full, filterable listing for /markets. */
export function MarketsExplorer() {
  const { markets, live } = useMarkets(8000);
  const [sector, setSector] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return markets.filter((m) => {
      const matchesSector = sector === "All" || m.sector === sector;
      const matchesQuery =
        !q || m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      return matchesSector && matchesQuery;
    });
  }, [markets, sector, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${
                sector === s
                  ? "border-mint/50 bg-mint/12 text-mint"
                  : "border-white/10 bg-white/3 text-ash hover:border-white/22 hover:text-chalk"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-[11px] tracking-wider text-smoke uppercase sm:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-mint" : "bg-smoke"}`} />
            {live ? "Live" : "Indicative"}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Apple, xNVDA…"
            aria-label="Search markets"
            className="h-11 w-full rounded-full border border-white/12 bg-white/4 px-4 text-[14px] text-chalk placeholder:text-smoke outline-none transition-colors focus:border-mint/50 lg:w-64"
          />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <MarketCard key={m.symbol} market={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-14 text-center text-[14px] text-smoke">
          Nothing matches that yet. More listings land with each cohort.
        </p>
      )}
    </div>
  );
}
