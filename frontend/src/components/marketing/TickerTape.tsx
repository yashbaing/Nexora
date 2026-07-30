"use client";

import { formatPercent, formatPrice, underlying } from "@/lib/markets";
import { useMarkets } from "@/lib/useMarkets";

export function TickerTape({ reverse = false }: { reverse?: boolean }) {
  const { markets, live } = useMarkets();
  const row = reverse ? [...markets].reverse() : markets;
  // Duplicated once so the -50% translation loops seamlessly.
  const loop = [...row, ...row];

  return (
    <div className="relative border-y border-white/8 bg-abyss/60 py-3.5">
      <div className="marquee-mask overflow-hidden">
        <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
          {loop.map((m, i) => {
            const up = m.changePercent >= 0;
            return (
              <div key={`${m.symbol}-${i}`} className="flex shrink-0 items-center gap-3 px-6">
                <span className="font-mono text-[12.5px] tracking-tight text-smoke">
                  {underlying(m.symbol)}
                </span>
                <span className="tabular text-[13.5px] font-medium text-chalk">
                  {formatPrice(m.price, m.currency)}
                </span>
                <span
                  className={`tabular text-[12.5px] font-medium ${up ? "text-mint" : "text-crimson"}`}
                >
                  {formatPercent(m.changePercent)}
                </span>
                <span className="text-white/10">/</span>
              </div>
            );
          })}
        </div>
      </div>

      <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-void/90 px-2.5 py-1 text-[10.5px] tracking-wider text-smoke uppercase lg:inline-flex">
        <span
          className={`relative h-1.5 w-1.5 rounded-full ${live ? "bg-mint" : "bg-smoke"}`}
        >
          {live && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint" />}
        </span>
        {live ? "Live feed" : "Indicative"}
      </span>
    </div>
  );
}
