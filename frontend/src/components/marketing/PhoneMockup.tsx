"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, Briefcase, TrendingUp, User, Wallet } from "lucide-react";

import { formatPercent, underlying } from "@/lib/markets";
import { useMarkets } from "@/lib/useMarkets";

/** A demo position book — the mock portfolio is priced off the real feed. */
const POSITIONS = [
  { symbol: "xNVDA", qty: 1.6482 },
  { symbol: "xAAPL", qty: 0.4215 },
  { symbol: "xTSLA", qty: 0.2508 },
] as const;

/** Fixed sparkline shape: deterministic so server and client markup agree. */
const SPARK = [18, 22, 19, 26, 24, 31, 28, 35, 33, 41, 38, 46, 44, 52, 49, 58, 61, 57, 66, 72];

const sparkPath = (points: number[], w: number, h: number) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

const ink = "#0c0a09";
const inkDim = "#57534e";
const inkMute = "#a8a29e";
const gain = "#16a34a";
const loss = "#dc2626";

export function PhoneMockup() {
  const { markets } = useMarkets(9000);
  const [tick, setTick] = useState(0);

  // A gentle heartbeat so the mock never looks like a static screenshot.
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => (t + 1) % 1000), 2600);
    return () => clearInterval(timer);
  }, []);

  const priced = POSITIONS.map((p) => {
    const market = markets.find((m) => m.symbol === p.symbol);
    const price = market?.price ?? 0;
    return {
      ...p,
      name: market?.name ?? p.symbol,
      price,
      value: price * p.qty,
      changePercent: market?.changePercent ?? 0,
    };
  });

  const netWorth = priced.reduce((sum, p) => sum + p.value, 0) + 1240.5;
  // Drift the displayed day change a hair on each tick — cosmetic only.
  const dayChange = 118.42 + (tick % 7) * 0.37;
  const dayPct = (dayChange / Math.max(netWorth, 1)) * 100;

  return (
    <div className="device relative h-[600px] w-[300px] sm:h-[660px] sm:w-[330px]">
      <div className="flex h-full flex-col bg-white">
        {/* Status / header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 pt-4 pb-3">
          <span
            className="text-[19px] leading-none"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.025em", color: ink }}
          >
            Nexora.
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-100">
            <Bell size={13} color={inkDim} />
          </span>
        </div>

        <div className="flex-1 overflow-hidden px-4 pt-4">
          {/* Net worth */}
          <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: inkMute }}>
            Net worth
          </p>
          <p
            className="tabular mt-1.5 text-[32px] leading-none"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em", color: ink }}
          >
            $
            {netWorth.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p
            className="tabular mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium"
            style={{ color: gain, background: "rgba(22,163,74,0.09)" }}
          >
            <ArrowUpRight size={12} />+${dayChange.toFixed(2)} ({dayPct.toFixed(2)}%) today
          </p>

          {/* Sparkline */}
          <div className="mt-4 h-[86px] w-full">
            <svg viewBox="0 0 260 86" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="mock-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gain} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={gain} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${sparkPath(SPARK, 260, 72)} L260 86 L0 86 Z`} fill="url(#mock-fill)" />
              <path
                d={sparkPath(SPARK, 260, 72)}
                fill="none"
                stroke={gain}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Holdings */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: inkMute }}>
              Holdings
            </p>
            <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: inkMute }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: gain }} />
              Live
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {priced.map((p) => {
              const up = p.changePercent >= 0;
              return (
                <div
                  key={p.symbol}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[10.5px] font-semibold"
                    style={{ color: ink, border: "1px solid #e7e5e4" }}
                  >
                    {underlying(p.symbol).slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold" style={{ color: ink }}>
                      {p.symbol}
                    </span>
                    <span className="tabular block text-[10.5px]" style={{ color: inkMute }}>
                      {p.qty.toFixed(4)} tokens
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tabular block text-[12.5px] font-medium" style={{ color: ink }}>
                      ${p.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className="tabular flex items-center justify-end gap-0.5 text-[10.5px] font-medium"
                      style={{ color: up ? gain : loss }}
                    >
                      {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {formatPercent(p.changePercent)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <span
              className="flex-1 rounded-full py-2.5 text-center text-[12.5px] font-semibold text-white"
              style={{ background: ink }}
            >
              Buy
            </span>
            <span
              className="flex-1 rounded-full border py-2.5 text-center text-[12.5px] font-semibold"
              style={{ borderColor: "#e7e5e4", color: ink }}
            >
              Sell
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around border-t border-stone-200 bg-white px-2 pt-2.5 pb-4">
          {[
            { icon: TrendingUp, label: "Home", active: true },
            { icon: Briefcase, label: "Markets", active: false },
            { icon: Wallet, label: "Wallet", active: false },
            { icon: User, label: "You", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <span key={label} className="flex flex-col items-center gap-1">
              <Icon size={16} color={active ? ink : inkMute} />
              <span
                className="text-[9.5px] font-medium"
                style={{ color: active ? ink : inkMute }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
