"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Ticker = {
  symbol: string;
  name: string;
  base: number;
  price: number;
  change: number;
};

const SEED: Omit<Ticker, "price" | "change">[] = [
  { symbol: "xAAPL", name: "Apple", base: 228.42 },
  { symbol: "xTSLA", name: "Tesla", base: 189.66 },
  { symbol: "xNVDA", name: "NVIDIA", base: 292.1 },
  { symbol: "xMSFT", name: "Microsoft", base: 185.08 },
  { symbol: "xGOOGL", name: "Alphabet", base: 154.12 },
  { symbol: "xMETA", name: "Meta", base: 247.86 },
];

const TICK_MS = 1500;
const fmt = (n: number) => `$${n.toFixed(2)}`;
const fmtSigned = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

function useLiveTickers() {
  const [tickers, setTickers] = useState<Ticker[]>(() =>
    SEED.map((s) => ({ ...s, price: s.base, change: 0 }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTickers((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.48) * (s.base * 0.005);
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

function MiniSpark({ up }: { up: boolean }) {
  const pts = useMemo(() => {
    let y = 12;
    return Array.from({ length: 12 }, (_, i) => {
      y += (Math.random() - (up ? 0.42 : 0.58)) * 4;
      y = Math.max(2, Math.min(18, y));
      return `${i * 4},${20 - y}`;
    }).join(" ");
  }, [up]);

  return (
    <svg width="44" height="20" viewBox="0 0 44 20" className="opacity-90">
      <polyline
        fill="none"
        stroke={up ? "#34d399" : "#fb7185"}
        strokeWidth="1.5"
        points={pts}
      />
    </svg>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-2 text-[9px] font-semibold text-white/50">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-3 rounded-sm bg-white/40" />
        <span className="h-1.5 w-2 rounded-sm bg-white/40" />
        <span className="h-2 w-4 rounded-sm bg-white/50" />
      </div>
    </div>
  );
}

function HomeScreen({ tickers }: { tickers: Ticker[] }) {
  const balance = useMemo(
    () => tickers.slice(0, 3).reduce((sum, t) => sum + t.price * 0.28, 0),
    [tickers]
  );
  const balanceChange = useMemo(
    () => tickers.slice(0, 3).reduce((sum, t) => sum + t.change, 0) / 3,
    [tickers]
  );
  const up = balanceChange >= 0;

  return (
    <div className="flex h-full flex-col bg-[#0b0e13] text-white">
      <StatusBar />
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
              Portfolio
            </div>
            <div className="mt-1 font-serif text-lg leading-none">Nexora Desk</div>
          </div>
          <div className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] text-emerald-300">
            LIVE
          </div>
        </div>

        <div className="mt-5 font-mono text-[2rem] font-semibold leading-none tracking-tight tabular-nums">
          {fmt(balance)}
        </div>
        <div
          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            up ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {fmtSigned(balanceChange)} today
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#f0a35e] py-2.5 text-center text-[11px] font-semibold text-[#0b0e13]">
            Buy
          </div>
          <div className="rounded-xl bg-white/10 py-2.5 text-center text-[11px] font-semibold text-white">
            Deposit
          </div>
        </div>
      </div>

      <div className="mt-5 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        Top movers
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1.5 px-3 pb-4">
        {tickers.slice(0, 4).map((t) => {
          const tUp = t.change >= 0;
          return (
            <div
              key={t.symbol}
              className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.06]"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold">{t.symbol}</div>
                <div className="truncate text-[9px] text-white/35">{t.name}</div>
              </div>
              <MiniSpark up={tUp} seed={t.symbol} />
              <div className="text-right">
                <div className="font-mono text-[11px] tabular-nums">{fmt(t.price)}</div>
                <div className={`font-mono text-[9px] ${tUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmtSigned(t.change)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketsScreen({ tickers }: { tickers: Ticker[] }) {
  return (
    <div className="flex h-full flex-col bg-[#0b0e13] text-white">
      <StatusBar />
      <div className="px-4 pt-5">
        <div className="font-serif text-xl leading-none">Markets</div>
        <div className="mt-1 text-[10px] text-white/40">Hyperliquid · streaming</div>
        <div className="mt-3 rounded-xl bg-white/[0.05] px-3 py-2 text-[10px] text-white/35 ring-1 ring-white/[0.06]">
          Search xAAPL, Tesla…
        </div>
        <div className="mt-3 flex gap-1.5">
          {["All", "Tech", "Auto", "Watch"].map((f, i) => (
            <div
              key={f}
              className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                i === 0 ? "bg-white text-[#0b0e13]" : "bg-white/[0.06] text-white/50"
              }`}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col px-2 pb-3">
        {tickers.map((t) => {
          const up = t.change >= 0;
          return (
            <div
              key={t.symbol}
              className="flex items-center justify-between border-b border-white/[0.05] px-2 py-2.5"
            >
              <div>
                <div className="font-mono text-[11px] font-semibold">{t.symbol}</div>
                <div className="text-[9px] text-white/35">{t.name}</div>
              </div>
              <MiniSpark up={up} />
              <div className="text-right">
                <div className="font-mono text-[11px] tabular-nums">{fmt(t.price)}</div>
                <div
                  className={`mt-0.5 inline-block rounded px-1.5 py-0.5 font-mono text-[9px] ${
                    up ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {fmtSigned(t.change)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StockScreen({ ticker }: { ticker: Ticker }) {
  const [bars, setBars] = useState(() =>
    Array.from({ length: 26 }, () => ({
      h: 25 + Math.random() * 65,
      up: Math.random() > 0.4,
    }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setBars((prev) => [
        ...prev.slice(1),
        { h: 25 + Math.random() * 65, up: Math.random() > 0.4 },
      ]);
    }, TICK_MS / 2);
    return () => clearInterval(t);
  }, []);

  const up = ticker.change >= 0;

  return (
    <div className="flex h-full flex-col bg-[#0b0e13] text-white">
      <StatusBar />
      <div className="px-4 pt-4">
        <div className="text-[9px] uppercase tracking-[0.18em] text-white/35">{ticker.name}</div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <div className="font-mono text-lg font-semibold">{ticker.symbol}</div>
          <div
            className={`font-mono text-[11px] ${up ? "text-emerald-400" : "text-rose-400"}`}
          >
            {fmtSigned(ticker.change)}
          </div>
        </div>
        <div className="mt-1 font-mono text-[1.75rem] font-semibold leading-none tabular-nums">
          {fmt(ticker.price)}
        </div>
      </div>

      <div className="relative mx-3 mt-3 h-[9.5rem] overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent ring-1 ring-white/[0.06]">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="absolute inset-x-2 bottom-2 top-3 flex items-end gap-[3px]">
          {bars.map((b, i) => (
            <div
              key={i}
              className="relative flex-1"
              style={{ height: `${b.h}%` }}
            >
              <div
                className={`absolute inset-x-[35%] top-0 bottom-0 ${
                  b.up ? "bg-emerald-400/70" : "bg-rose-400/70"
                }`}
              />
              <div
                className={`absolute inset-x-0 top-[20%] bottom-[20%] rounded-[1px] ${
                  b.up ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 px-4">
        {["1H", "1D", "1W", "1M"].map((r, i) => (
          <div
            key={r}
            className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
              i === 1 ? "bg-white text-[#0b0e13]" : "text-white/40"
            }`}
          >
            {r}
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 px-4 pb-4">
        <div className="rounded-xl bg-rose-500/90 py-2.5 text-center text-[11px] font-semibold">
          Sell
        </div>
        <div className="rounded-xl bg-emerald-500 py-2.5 text-center text-[11px] font-semibold text-[#0b0e13]">
          Buy
        </div>
      </div>
    </div>
  );
}

function WalletScreen({ tickers }: { tickers: Ticker[] }) {
  const usdc = useMemo(() => 248 + tickers[0].change * 3.2, [tickers]);
  const holdings = tickers.slice(0, 3);

  return (
    <div className="flex h-full flex-col bg-[#0b0e13] text-white">
      <StatusBar />
      <div className="px-4 pt-5">
        <div className="font-serif text-xl leading-none">Wallet</div>
        <div className="mt-1 text-[10px] text-white/40">Self-custody · Nexora L1</div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#1a2230] to-[#0f131a] p-4 ring-1 ring-white/10">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">USDC</div>
          <div className="mt-1 font-mono text-[1.7rem] font-semibold leading-none tabular-nums">
            {fmt(usdc)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#f0a35e] py-2 text-center text-[10px] font-semibold text-[#0b0e13]">
              Mint faucet
            </div>
            <div className="rounded-xl bg-white/10 py-2 text-center text-[10px] font-semibold">
              Send
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        Holdings
      </div>
      <div className="mt-2 flex flex-col gap-1.5 px-3 pb-4">
        {holdings.map((t, i) => (
          <div
            key={t.symbol}
            className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.06]"
          >
            <div>
              <div className="font-mono text-[11px] font-semibold">{t.symbol}</div>
              <div className="text-[9px] text-white/35">{(0.4 + i * 0.15).toFixed(2)} tokens</div>
            </div>
            <div className="text-right font-mono text-[11px] tabular-nums">
              {fmt(t.price * (0.4 + i * 0.15))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PHONE_W = 192;
const PHONE_H = 392;
const SIDE_SCALE = 0.78;

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
  const className = `phone-shell relative shrink-0 overflow-hidden rounded-[1.7rem] border-[5px] border-[#1a1f28] bg-[#1a1f28] transition-all duration-500 ease-out ${
    dimmed
      ? "cursor-pointer opacity-50 shadow-lg shadow-black/40 hover:opacity-85"
      : "z-10 opacity-100 shadow-2xl shadow-black/50"
  }`;
  const style = { width: PHONE_W, height: PHONE_H };
  const inner = (
    <>
      <div className="pointer-events-none absolute top-2 left-1/2 z-20 h-3.5 w-14 -translate-x-1/2 rounded-full bg-black" />
      <div className="h-full w-full overflow-hidden rounded-[1.3rem] bg-[#0b0e13]">{children}</div>
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
    <div className="relative hidden shrink-0 md:block" style={{ width: boxW, height: boxH }}>
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
  {
    key: "home",
    label: "Home",
    title: "Your book, live",
    description: "Portfolio value and movers update with every Hyperliquid tick.",
  },
  {
    key: "markets",
    label: "Markets",
    title: "The full equity board",
    description: "Scan tokenized names with sparklines and 24h change at a glance.",
  },
  {
    key: "stock",
    label: "Charts",
    title: "Candles for conviction",
    description: "Intraday price action with one-tap buy and sell.",
  },
  {
    key: "wallet",
    label: "Wallet",
    title: "USDC under your keys",
    description: "Faucet, send, and holdings — self-custody on Nexora L1.",
  },
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
        return <StockScreen ticker={tickers[2]} />;
      default:
        return <WalletScreen tickers={tickers} />;
    }
  };

  return (
    <section
      id="app"
      className="relative overflow-hidden bg-[#07090d] py-16 text-white md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(240,163,94,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(52,211,153,0.08),transparent_60%)]" />
        <svg
          className="absolute bottom-[8%] left-1/2 h-36 w-[min(900px,90%)] -translate-x-1/2 opacity-[0.16]"
          viewBox="0 0 900 140"
          fill="none"
        >
          {(
            [
              [30, 80, 45, true],
              [70, 60, 70, false],
              [110, 75, 50, true],
              [150, 40, 85, true],
              [190, 90, 35, false],
              [230, 55, 75, true],
              [270, 70, 55, false],
              [310, 35, 90, true],
              [350, 65, 60, true],
              [390, 95, 30, false],
              [430, 50, 80, true],
              [470, 78, 48, false],
              [510, 42, 88, true],
              [550, 68, 58, true],
              [590, 88, 40, false],
              [630, 52, 78, true],
              [670, 72, 52, false],
              [710, 48, 82, true],
              [750, 85, 38, false],
              [790, 58, 70, true],
              [830, 74, 50, true],
            ] as const
          ).map(([x, bodyTop, bodyH, up], i) => (
            <g key={i} className="animate-candle" style={{ animationDelay: `${i * 0.1}s` }}>
              <line
                x1={x}
                x2={x}
                y1={bodyTop - 16}
                y2={bodyTop + bodyH + 16}
                stroke={up ? "#34d399" : "#fb7185"}
                strokeWidth="1.4"
              />
              <rect
                x={x - 6}
                y={bodyTop}
                width="12"
                height={bodyH}
                rx="1.5"
                fill={up ? "#34d399" : "#fb7185"}
                opacity="0.7"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
          Product
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight md:text-5xl">
          The desk, in your pocket.
        </h2>
        <p className="mt-3 text-sm text-white/50">
          Live mock of the Nexora app — prices tick like production.
        </p>
      </div>

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
        <p className="mt-1 text-sm leading-relaxed text-white/45">{scenes[active].description}</p>
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
                ? "bg-white text-[#07090d]"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
