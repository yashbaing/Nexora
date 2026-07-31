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
      <div
        className={
          size === "lg"
            ? "font-mono text-xl font-semibold text-stone-950"
            : "font-mono text-[11px] font-semibold text-stone-950"
        }
      >
        {fmt(value)}
      </div>
      <div
        className={`flex items-center justify-end gap-0.5 font-mono ${size === "lg" ? "text-[11px]" : "text-[9px]"} ${
          up ? "text-emerald-600" : "text-rose-600"
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
    <div className="flex h-full flex-col bg-[#fafaf8] px-3.5 pt-10 pb-3.5 text-stone-950">
      <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.18em] text-stone-400">
        <span>Active wallet</span>
        <span className="font-mono normal-case tracking-normal text-stone-500">0x6A63…453f</span>
      </div>

      <div className="mt-2.5 flex gap-1 overflow-hidden">
        {tickers.slice(3, 6).map((t) => (
          <div
            key={t.symbol}
            className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[8px] whitespace-nowrap ring-1 ring-stone-200/80"
          >
            <span className="font-semibold text-stone-700">{t.symbol}</span>
            <span className={t.change >= 0 ? "text-emerald-600" : "text-rose-600"}>{fmtSigned(t.change)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-stone-400">Total value</div>
      <div className="mt-0.5 font-mono text-[1.7rem] font-bold leading-none tabular-nums text-stone-950">
        {fmt(balance)}
      </div>
      <div className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
        {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {fmtSigned(balanceChange)} today
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-1.5">
        <div className="rounded-xl bg-stone-950 py-2 text-center text-[10px] font-semibold text-white">+ Deposit</div>
        <div className="rounded-xl bg-white py-2 text-center text-[10px] font-semibold text-stone-600 ring-1 ring-stone-200">
          Markets
        </div>
      </div>

      <div className="mt-4 text-[11px] font-semibold text-stone-950">Movers</div>
      <div className="mt-1.5 flex flex-col gap-1">
        {tickers.slice(0, 3).map((t) => (
          <div
            key={t.symbol}
            className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2 ring-1 ring-stone-200/70"
          >
            <div>
              <div className="font-mono text-[10px] font-semibold text-stone-950">{t.symbol}</div>
              <div className="text-[8px] text-stone-400">Equity token</div>
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
    <div className="flex h-full flex-col bg-[#fafaf8] px-3.5 pt-10 pb-3.5 text-stone-950">
      <div className="font-serif text-lg leading-none">Markets</div>
      <div className="mt-1 text-[9px] text-stone-400">Live Hyperliquid quotes</div>
      <div className="mt-2.5 rounded-full bg-white px-3 py-1.5 text-[9px] text-stone-400 ring-1 ring-stone-200">
        Search by symbol or name
      </div>
      <div className="mt-2.5 flex gap-1">
        {["All", "Tech", "Auto", "Finance"].map((f, i) => (
          <div
            key={f}
            className={`rounded-full px-2 py-1 text-[8px] font-medium ${
              i === 0 ? "bg-stone-950 text-white" : "bg-white text-stone-500 ring-1 ring-stone-200"
            }`}
          >
            {f}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col divide-y divide-stone-200/70">
        {tickers.map((t) => (
          <div key={t.symbol} className="flex items-center justify-between py-2">
            <div>
              <div className="font-mono text-[10px] font-semibold text-stone-950">{t.symbol}</div>
              <div className="text-[8px] text-stone-400">{t.name}</div>
            </div>
            <PriceTag value={t.price} change={t.change} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StockScreen({ ticker }: { ticker: Ticker }) {
  const bars = useMemo(() => Array.from({ length: 24 }, () => 28 + Math.random() * 62), [ticker.symbol]);
  const [heights, setHeights] = useState(bars);

  useEffect(() => {
    const t = setInterval(() => {
      setHeights((prev) => [...prev.slice(1), 28 + Math.random() * 62]);
    }, TICK_MS / 2);
    return () => clearInterval(t);
  }, []);

  const up = ticker.change >= 0;

  return (
    <div className="flex h-full flex-col bg-[#fafaf8] px-3.5 pt-10 pb-3.5 text-stone-950">
      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-stone-400">{ticker.name}</div>
      <div className="font-mono text-base font-semibold">{ticker.symbol}</div>
      <div className="mt-1.5 flex items-end justify-between">
        <div className="font-mono text-[1.7rem] font-bold leading-none tabular-nums">{fmt(ticker.price)}</div>
        <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {fmtSigned(ticker.change)}
        </div>
      </div>
      <div className="mt-3.5 flex h-24 items-end gap-[2.5px] rounded-xl bg-white px-2 py-2 ring-1 ring-stone-200/70">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-700 ease-out ${
              i % 3 === 0 ? "bg-rose-300" : "bg-emerald-400"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-1.5">
        {["1H", "1D", "1W"].map((r, i) => (
          <div
            key={r}
            className={`rounded-full px-2.5 py-1 text-[8px] font-medium ${
              i === 0 ? "bg-stone-950 text-white" : "text-stone-400"
            }`}
          >
            {r}
          </div>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-1.5">
        <div className="rounded-xl bg-white py-2 text-center text-[10px] font-semibold text-rose-500 ring-1 ring-rose-200">
          Sell
        </div>
        <div className="rounded-xl bg-emerald-600 py-2 text-center text-[10px] font-semibold text-white">
          Buy {ticker.symbol}
        </div>
      </div>
    </div>
  );
}

function WalletScreen({ tickers }: { tickers: Ticker[] }) {
  const usdc = useMemo(() => 240 + tickers[0].change * 4, [tickers]);
  return (
    <div className="flex h-full flex-col bg-[#fafaf8] px-3.5 pt-10 pb-3.5 text-stone-950">
      <div className="font-serif text-lg leading-none">Wallet</div>
      <div className="mt-1 text-[9px] text-stone-400">Fund account &amp; check USDC</div>

      <div className="mt-3.5 rounded-2xl bg-stone-950 p-3.5 text-white">
        <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-stone-400">USDC balance</div>
        <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{fmt(usdc)}</div>
        <div className="mt-1 text-[8px] text-stone-500">Nexora L1 settlement</div>
      </div>

      <div className="mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-dashed ring-stone-300">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> USDC Faucet
        </div>
        <p className="mt-1 text-[9px] leading-relaxed text-stone-500">
          Mint mock USDC to test tokenized stock purchases.
        </p>
        <div className="mt-2.5 rounded-xl bg-stone-950 py-2 text-center text-[10px] font-semibold text-white">
          Mint Mock USDC
        </div>
      </div>

      <div className="mt-3 text-[11px] font-semibold">Contracts</div>
      <div className="mt-1.5 flex flex-col gap-1">
        {["Platform", "USDC", "Oracle signer"].map((label, i) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl bg-white px-2.5 py-1.5 text-[9px] ring-1 ring-stone-200/70"
          >
            <span className="text-stone-500">{label}</span>
            <span className="font-mono text-stone-400">
              0x{(i + 1).toString().padStart(2, "0")}…f{7 - i}b1
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Comfortable phone size — smaller than a real device mock so the stage breathes. */
const PHONE_W = 200;
const PHONE_H = 408;
const SIDE_SCALE = 0.72;

function PhoneShell({
  children,
  dimmed = false,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  dimmed?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const className = `phone-shell relative shrink-0 overflow-hidden rounded-[1.75rem] border-[5px] border-[#14110f] bg-[#14110f] transition-all duration-500 ease-out ${
    dimmed
      ? "cursor-pointer opacity-[0.5] shadow-lg shadow-black/30 hover:opacity-85"
      : "z-10 opacity-100 shadow-2xl shadow-black/45"
  }`;
  const style = { width: PHONE_W, height: PHONE_H };
  const inner = (
    <>
      <div className="pointer-events-none absolute top-2 left-1/2 z-20 h-3.5 w-14 -translate-x-1/2 rounded-full bg-black/90" />
      <div className="h-full w-full overflow-hidden rounded-[1.35rem] bg-white">{children}</div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" aria-label={ariaLabel} onClick={onClick} className={className} style={style}>
        {inner}
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}

function SidePhone({
  children,
  rotate,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  rotate: number;
  onClick: () => void;
  ariaLabel: string;
}) {
  const boxW = PHONE_W * SIDE_SCALE;
  const boxH = PHONE_H * SIDE_SCALE;
  return (
    <div
      className="relative hidden shrink-0 md:block"
      style={{ width: boxW, height: boxH }}
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center transition-transform duration-500"
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transform: `translate(-50%, -50%) scale(${SIDE_SCALE}) rotate(${rotate}deg)`,
        }}
      >
        <PhoneShell dimmed onClick={onClick} ariaLabel={ariaLabel}>
          {children}
        </PhoneShell>
      </div>
    </div>
  );
}

const scenes = [
  { key: "home", label: "Home", title: "Your wealth, live", description: "Balance and top movers update in real time." },
  { key: "markets", label: "Markets", title: "Markets that never sleep", description: "Live tokenized equity quotes, ticking every second." },
  { key: "stock", label: "Charts", title: "Charts built for conviction", description: "Live candles and price action for every stock." },
  { key: "wallet", label: "Wallet", title: "USDC in your control", description: "Self-custody balance with a built-in testnet faucet." },
];

const AUTO_MS = 5000;

function TradingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="trading-floor absolute inset-0" />
      <div className="trading-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0c0a09] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0c0a09] to-transparent" />

      {/* Soft candle silhouettes */}
      <svg
        className="absolute bottom-[12%] left-1/2 h-40 w-[min(920px,92%)] -translate-x-1/2 opacity-[0.14]"
        viewBox="0 0 920 160"
        fill="none"
      >
        {(
          [
            [40, 90, 50, true],
            [90, 70, 70, false],
            [140, 85, 45, true],
            [190, 55, 85, true],
            [240, 95, 40, false],
            [290, 60, 78, true],
            [340, 80, 55, false],
            [390, 48, 90, true],
            [440, 72, 60, true],
            [490, 100, 35, false],
            [540, 58, 82, true],
            [590, 88, 48, false],
            [640, 50, 88, true],
            [690, 75, 58, true],
            [740, 95, 42, false],
            [790, 62, 76, true],
            [840, 80, 52, false],
          ] as const
        ).map(([x, bodyTop, bodyH, up], i) => (
          <g key={i} className="animate-candle" style={{ animationDelay: `${i * 0.12}s` }}>
            <line
              x1={x}
              x2={x}
              y1={bodyTop - 18}
              y2={bodyTop + bodyH + 18}
              stroke={up ? "#34d399" : "#fb7185"}
              strokeWidth="1.5"
              opacity="0.7"
            />
            <rect
              x={x - 7}
              y={bodyTop}
              width="14"
              height={bodyH}
              rx="2"
              fill={up ? "#34d399" : "#fb7185"}
              opacity="0.55"
            />
          </g>
        ))}
      </svg>

      {/* Floating price chips */}
      <div className="animate-float-slow absolute top-[18%] left-[8%] hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-emerald-300/80 backdrop-blur-sm lg:block">
        xNVDA +2.14%
      </div>
      <div className="animate-float-delayed absolute top-[28%] right-[9%] hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-rose-300/80 backdrop-blur-sm lg:block">
        xTSLA −0.68%
      </div>
      <div className="animate-float-slow absolute bottom-[22%] left-[14%] hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-stone-300/70 backdrop-blur-sm md:block">
        USDC settle · 1.2s
      </div>
    </div>
  );
}

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
      className="relative overflow-hidden bg-[#0c0a09] py-16 text-white md:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TradingBackdrop />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-stone-500">
          [ A day with Nexora ]
        </div>
        <h2 className="mt-5 font-serif text-3xl tracking-tight text-white md:mt-6 md:text-5xl">
          Every market. One on-chain loop.
        </h2>
        <p className="mt-3 text-sm text-stone-400">
          Live simulation — prices tick every second, just like the real app.
        </p>
      </div>

      {/* Flex stage — reserved side slots so phones never overlap or collapse */}
      <div className="relative mx-auto mt-10 flex max-w-5xl items-center justify-center gap-6 px-4 md:mt-12 lg:gap-10">
        <SidePhone
          rotate={-7}
          ariaLabel={`Show ${scenes[prev].label}`}
          onClick={() => {
            setPaused(true);
            go(-1);
          }}
        >
          {renderScene(scenes[prev].key)}
        </SidePhone>

        <PhoneShell>{renderScene(scenes[active].key)}</PhoneShell>

        <SidePhone
          rotate={7}
          ariaLabel={`Show ${scenes[next].label}`}
          onClick={() => {
            setPaused(true);
            go(1);
          }}
        >
          {renderScene(scenes[next].key)}
        </SidePhone>
      </div>

      <div className="relative mx-auto mt-8 h-[3.25rem] max-w-md px-6 text-center md:mt-9">
        <div className="text-base font-semibold text-white">{scenes[active].title}</div>
        <p className="mt-1 text-sm leading-relaxed text-stone-400">{scenes[active].description}</p>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2 px-6 md:mt-4">
        {scenes.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              setPaused(true);
              setActive(i);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              i === active
                ? "bg-white text-stone-950 shadow-md shadow-black/30"
                : "text-stone-500 hover:text-stone-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
