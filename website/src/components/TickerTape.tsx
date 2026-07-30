import { TOKENIZED_ASSETS } from "@/lib/data";

function TickerItem({ symbol, name, price, changePercent }: (typeof TOKENIZED_ASSETS)[number]) {
  const up = changePercent >= 0;
  return (
    <div className="flex shrink-0 items-center gap-3 border-r border-white/[0.06] px-6 py-4">
      <span className="text-sm font-semibold text-white">{symbol}</span>
      <span className="hidden text-xs text-white/35 sm:inline">{name}</span>
      <span className="font-mono-num text-sm text-white/80">
        {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span
        className={`font-mono-num rounded-full px-2 py-0.5 text-xs font-medium ${
          up ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
        }`}
      >
        {up ? "▲" : "▼"} {up ? "+" : ""}
        {changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

export default function TickerTape() {
  const doubled = [...TOKENIZED_ASSETS, ...TOKENIZED_ASSETS];

  return (
    <div className="relative border-y border-white/[0.07] bg-white/[0.015] py-0">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#05060a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#05060a] to-transparent" />
      <div className="marquee-track flex w-max">
        {doubled.map((asset, i) => (
          <TickerItem key={`${asset.symbol}-${i}`} {...asset} />
        ))}
      </div>
    </div>
  );
}
