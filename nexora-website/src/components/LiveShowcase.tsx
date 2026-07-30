"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";

type Ticker = {
  symbol: string;
  name: string;
  base: number;
  price: number;
  change: number;
};

const SEED: Omit<Ticker, "price" | "change">[] = [
  { symbol: "xAAPL", name: "Apple Inc.", base: 228.42 },
  { symbol: "xTSLA", name: "Tesla Inc.", base: 189.66 },
  { symbol: "xNVDA", name: "NVIDIA Corp.", base: 292.1 },
  { symbol: "xMSFT", name: "Microsoft Corp.", base: 185.08 },
  { symbol: "xGOOGL", name: "Alphabet Inc.", base: 154.12 },
  { symbol: "xMETA", name: "Meta Platforms", base: 247.86 },
];

const TICK_MS = 1600;

function useLiveTickers() {
  const [tickers, setTickers] = useState<Ticker[]>(() =>
    SEED.map((s) => ({ ...s, price: s.base, change: 0 }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTickers((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.48) * (s.base * 0.006);
          const price = Math.max(1, s.price + delta);
          const change = ((price - s.base) / s.base) * 100;
          return { ...s, price, change };
        })
      );
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  return tickers;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;
const fmtSigned = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

function PriceTag({ value, change, size = "sm" }: { value: number; change: number; size?: "sm" | "lg" }) {
  const up = change >= 0;
  return (
    <div className="text-right">
      <div className={size === "lg" ? "font-mono text-2xl font-semibold text-stone-950" : "font-mono text-xs font-semibold text-stone-950"}>
        {fmt(value)}
      </div>
      <div
        className={`flex items-center justify-end gap-0.5 font-mono ${size === "lg" ? "text-xs" : "text-[10px]"} ${
          up ? "text-green-600" : "text-red-600"
        }`}
      >
        {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {fmtSigned(change)}
      </div>
    </div>
  );
}

function HomeScreen({ tickers }: { tickers: Ticker[] }) {
  const balance = useMemo(
    () => tickers.slice(0, 3).reduce((sum, t) => sum + t.price * 0.32, 0),
    [tickers]
  );
  const balanceChange = useMemo(
    () => tickers.slice(0, 3).reduce((sum, t) => sum + t.change, 0) / 3,
    [tickers]
  );
  const up = balanceChange >= 0;

  return (
    <div className="flex h-full flex-col bg-white px-4 pt-11 pb-4 text-stone-950">
      <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-widest text-stone-400">
        <span>Active wallet</span>
        <span className="font-mono normal-case tracking-normal text-stone-500">0x6A63…453f</span>
      </div>

      <div className="mt-3 flex gap-2 overflow-hidden">
        {tickers.slice(3).map((t) => (
          <div key={t.symbol} className="flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-1 font-mono text-[9px]">
            <span className="font-semibold text-stone-700">{t.symbol}</span>
            <span className={t.change >= 0 ? "text-green-600" : "text-red-600"}>{fmtSigned(t.change)}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 text-[9px] font-semibold uppercase tracking-widest text-stone-400">Total value</div>
      <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-stone-950">{fmt(balance)}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>
        {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {fmtSigned(balanceChange)} today
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-stone-950 py-2.5 text-center text-[11px] font-semibold text-white">+ Deposit USDC</div>
        <div className="rounded-xl border border-stone-200 py-2.5 text-center text-[11px] font-semibold text-stone-600">Markets</div>
      </div>

      <div className="mt-5 text-xs font-semibold text-stone-950">Movers</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {tickers.slice(0, 3).map((t) => (
          <div key={t.symbol} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">
            <div>
              <div className="font-mono text-[11px] font-semibold text-stone-950">{t.symbol}</div>
              <div className="text-[9px] text-stone-400">Equity token</div>
            </div>
            <PriceTag value={t.price} change={t.change} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketsScreen({ tickers }: { tickers: Ticker[] }) {
  return (
    <div className="flex h-full flex-col bg-white px-4 pt-11 pb-4 text-stone-950">
      <div className="font-serif text-xl">Markets</div>
      <div className="text-[10px] text-stone-400">Real-time quotes powered by Hyperliquid</div>
      <div className="mt-3 rounded-full bg-stone-100 px-3 py-2 text-[10px] text-stone-400">Search by symbol or name</div>
      <div className="mt-3 flex gap-1.5">
        {["All", "Tech", "Auto", "Finance"].map((f, i) => (
          <div
            key={f}
            className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
              i === 0 ? "bg-stone-950 text-white" : "border border-stone-200 text-stone-500"
            }`}
          >
            {f}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col divide-y divide-stone-100">
        {tickers.map((t) => (
          <div key={t.symbol} className="flex items-center justify-between py-2.5">
            <div>
              <div className="font-mono text-[11px] font-semibold text-stone-950">{t.symbol}</div>
              <div className="text-[9px] text-stone-400">{t.name}</div>
            </div>
            <PriceTag value={t.price} change={t.change} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StockScreen({ ticker }: { ticker: Ticker }) {
  const bars = useMemo(() => Array.from({ length: 28 }, () => 30 + Math.random() * 60), [ticker.symbol]);
  const [heights, setHeights] = useState(bars);

  useEffect(() => {
    const t = setInterval(() => {
      setHeights((prev) => {
        const next = [...prev.slice(1), 30 + Math.random() * 60];
        return next;
      });
    }, TICK_MS / 2);
    return () => clearInterval(t);
  }, []);

  const up = ticker.change >= 0;

  return (
    <div className="flex h-full flex-col bg-white px-4 pt-11 pb-4 text-stone-950">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">{ticker.name}</div>
      <div className="font-mono text-lg font-semibold">{ticker.symbol}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="font-mono text-3xl font-bold tabular-nums">{fmt(ticker.price)}</div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {fmtSigned(ticker.change)}
        </div>
      </div>
      <div className="mt-4 flex h-28 items-end gap-[3px]">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-700 ease-out ${
              i % 3 === 0 ? "bg-red-300" : "bg-green-300"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {["1H", "1D", "1W"].map((r, i) => (
          <div key={r} className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${i === 0 ? "bg-stone-950 text-white" : "text-stone-400"}`}>
            {r}
          </div>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-red-200 py-2.5 text-center text-[11px] font-semibold text-red-500">Sell</div>
        <div className="rounded-xl bg-green-600 py-2.5 text-center text-[11px] font-semibold text-white">Buy {ticker.symbol}</div>
      </div>
    </div>
  );
}

function WalletScreen({ tickers }: { tickers: Ticker[] }) {
  const usdc = useMemo(() => 240 + tickers[0].change * 4, [tickers]);
  return (
    <div className="flex h-full flex-col bg-white px-4 pt-11 pb-4 text-stone-950">
      <div className="font-serif text-xl">Wallet</div>
      <div className="text-[10px] text-stone-400">Fund account &amp; check USDC balance</div>

      <div className="mt-4 rounded-2xl bg-stone-100 p-4">
        <div className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">USDC settlement balance</div>
        <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{fmt(usdc)}</div>
        <div className="mt-1 text-[9px] text-stone-400">Nexora L1 settlement</div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-stone-200 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" /> USDC Faucet
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-stone-500">
          Obtain mock USDC to test tokenized stock purchases.
        </p>
        <div className="mt-3 rounded-xl bg-stone-950 py-2.5 text-center text-[11px] font-semibold text-white">Mint Mock USDC</div>
      </div>

      <div className="mt-4 text-xs font-semibold">Contract diagnostics</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {["Platform contract", "USDC contract", "Backend signer"].map((label, i) => (
          <div key={label} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-[10px]">
            <span className="text-stone-500">{label}</span>
            <span className="font-mono text-stone-400">0x{(i + 1).toString().padStart(2, "0")}…f{7 - i}b1</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NATURAL_W = 260;
const NATURAL_H = 560;
const MINI_W = 176;
const SCALE = MINI_W / NATURAL_W;
const MINI_H = NATURAL_H * SCALE;

function MiniPreview({
  scene,
  rotate,
  side,
  onClick,
  render,
}: {
  scene: { key: string; label: string };
  rotate: number;
  side: "left" | "right";
  onClick: () => void;
  render: (key: string) => ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`Show ${scene.label}`}
      onClick={onClick}
      className={`absolute top-1/2 hidden -translate-y-1/2 cursor-pointer overflow-hidden rounded-[1.6rem] border-[5px] border-stone-950 bg-stone-950 opacity-40 shadow-xl shadow-stone-950/15 transition-all duration-500 hover:opacity-75 md:block ${
        side === "left" ? "left-[4%] lg:left-[10%]" : "right-[4%] lg:right-[10%]"
      }`}
      style={{
        width: MINI_W,
        height: MINI_H,
        transform: `translateY(-50%) rotate(${rotate}deg)`,
      }}
    >
      <div
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
        }}
      >
        {render(scene.key)}
      </div>
    </button>
  );
}

const scenes = [
  { key: "home", label: "Home", title: "Your wealth, live", description: "Balance and top movers update in real time." },
  { key: "markets", label: "Markets", title: "Markets that never sleep", description: "Live tokenized equity quotes, ticking every second." },
  { key: "stock", label: "Charts", title: "Charts built for conviction", description: "Live candles and price action for every stock." },
  { key: "wallet", label: "Wallet", title: "USDC in your control", description: "Self-custody balance with a built-in testnet faucet." },
];

const AUTO_MS = 5000;

export default function LiveShowcase() {
  const tickers = useLiveTickers();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: 1 | -1) => {
    setActive((i) => (i + dir + scenes.length) % scenes.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, go]);

  const prev = (active - 1 + scenes.length) % scenes.length;
  const next = (active + 1) % scenes.length;

  const renderScene = (key: string) => {
    switch (key) {
      case "home":
        return <HomeScreen tickers={tickers} />;
      case "markets":
        return <MarketsScreen tickers={tickers} />;
      case "stock":
        return <StockScreen ticker={tickers[1]} />;
      default:
        return <WalletScreen tickers={tickers} />;
    }
  };

  return (
    <section
      id="app"
      className="relative overflow-hidden border-y border-stone-200 bg-stone-50 py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-stone-400">
          [ A day with Nexora ]
        </div>
        <h2 className="mt-6 font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
          Every market. One on-chain loop.
        </h2>
        <p className="mt-3 text-sm text-stone-500">
          This is a live simulation — prices tick every second, just like the real app.
        </p>
      </div>

      <div className="relative mx-auto mt-14 h-[500px] max-w-6xl md:h-[560px]">
        <MiniPreview
          scene={scenes[prev]}
          rotate={-9}
          side="left"
          onClick={() => { setPaused(true); go(-1); }}
          render={renderScene}
        />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[232px] -translate-x-1/2 -translate-y-1/2 md:h-[560px] md:w-[260px]">
          <div className="h-full w-full overflow-hidden rounded-[2.4rem] border-[6px] border-stone-950 bg-stone-950 shadow-2xl shadow-stone-950/25">
            {renderScene(scenes[active].key)}
          </div>
        </div>

        <MiniPreview
          scene={scenes[next]}
          rotate={9}
          side="right"
          onClick={() => { setPaused(true); go(1); }}
          render={renderScene}
        />
      </div>

      <div className="mx-auto mt-10 h-14 max-w-md px-6 text-center">
        <div className="text-base font-semibold text-stone-950">{scenes[active].title}</div>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">{scenes[active].description}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 px-6">
        {scenes.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => { setPaused(true); setActive(i); }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              i === active
                ? "bg-white text-stone-950 shadow-md shadow-stone-950/10 ring-1 ring-stone-200"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
