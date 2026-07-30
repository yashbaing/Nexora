"use client";

const TICKER_ITEMS = [
  { sym: "xAAPL", name: "Apple", price: "227.42", chg: "+1.24%" },
  { sym: "xTSLA", name: "Tesla", price: "342.18", chg: "+2.87%" },
  { sym: "xNVDA", name: "NVIDIA", price: "128.91", chg: "+3.12%" },
  { sym: "xMSFT", name: "Microsoft", price: "415.60", chg: "+0.89%" },
  { sym: "xGOOGL", name: "Alphabet", price: "178.33", chg: "-0.42%" },
  { sym: "xAMZN", name: "Amazon", price: "198.76", chg: "+1.55%" },
  { sym: "xMETA", name: "Meta", price: "512.04", chg: "+2.01%" },
  { sym: "xRELI", name: "Reliance", price: "₹2,847", chg: "+0.67%" },
  { sym: "xTCS", name: "TCS", price: "₹4,102", chg: "+0.31%" },
  { sym: "xJPM", name: "JPMorgan", price: "198.22", chg: "+0.78%" },
];

function TickerRow() {
  return (
  <>
    {TICKER_ITEMS.map((item) => (
      <div
        key={item.sym}
        className="flex items-center gap-3 px-4 py-2 landing-glass rounded-full shrink-0"
      >
        <span className="font-mono text-xs text-cyan-300">{item.sym}</span>
        <span className="text-sm text-zinc-400">{item.name}</span>
        <span className="font-semibold text-sm">{item.price}</span>
        <span
          className={`text-xs font-medium ${
            item.chg.startsWith("-") ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {item.chg}
        </span>
      </div>
    ))}
  </>
  );
}

export function MarketTicker() {
  return (
    <section className="py-4 border-y border-white/5 bg-[#08080f]/80 overflow-hidden">
      <div className="flex landing-ticker-track">
        <TickerRow />
        <TickerRow />
      </div>
    </section>
  );
}
