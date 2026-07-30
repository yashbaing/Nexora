"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const shots = [
  {
    src: "/screens/home.png",
    label: "Home",
    title: "Your wealth at a glance",
    description: "Total portfolio value, top movers, and full on-chain history.",
  },
  {
    src: "/screens/markets.png",
    label: "Markets",
    title: "Markets that never sleep",
    description: "Live tokenized equity quotes streamed from Hyperliquid, 24/7.",
  },
  {
    src: "/screens/stock.png",
    label: "Charts",
    title: "Charts built for conviction",
    description: "Real-time candlesticks, token stats, and one-tap buy or sell.",
  },
  {
    src: "/screens/wallet.png",
    label: "Wallet",
    title: "USDC in your control",
    description: "Self-custody settlement balance with a built-in testnet faucet.",
  },
];

const AUTO_MS = 4500;

export default function AppShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: 1 | -1) => {
    setActive((i) => (i + dir + shots.length) % shots.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, go]);

  const prev = (active - 1 + shots.length) % shots.length;
  const next = (active + 1) % shots.length;

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
      </div>

      <div className="relative mx-auto mt-14 h-[500px] max-w-6xl md:h-[560px]">
        {/* Left tilted card — previous screen */}
        <button
          type="button"
          aria-label={`Show ${shots[prev].label}`}
          onClick={() => { setPaused(true); go(-1); }}
          className="absolute left-[4%] top-1/2 hidden w-[180px] -translate-y-1/2 -rotate-[9deg] cursor-pointer overflow-hidden rounded-[1.8rem] opacity-50 shadow-xl shadow-stone-950/15 transition-all duration-500 hover:-rotate-[6deg] hover:opacity-80 md:block lg:left-[10%]"
        >
          <Image
            src={shots[prev].src}
            alt={shots[prev].title}
            width={780}
            height={1688}
            className="w-full"
          />
        </button>

        {/* Center phone — active screen with crossfade */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[232px] -translate-x-1/2 -translate-y-1/2 md:h-[560px] md:w-[260px]">
          {shots.map((s, i) => (
            <div
              key={s.src}
              aria-hidden={i !== active}
              className={`absolute inset-0 overflow-hidden rounded-[2.4rem] border-[6px] border-stone-950 bg-stone-950 shadow-2xl shadow-stone-950/25 transition-all duration-500 ease-out ${
                i === active ? "z-10 opacity-100 scale-100" : "z-0 opacity-0 scale-[0.96]"
              }`}
            >
              <Image
                src={s.src}
                alt={s.title}
                width={780}
                height={1688}
                priority={i === 0}
                className="h-full w-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Right tilted card — next screen */}
        <button
          type="button"
          aria-label={`Show ${shots[next].label}`}
          onClick={() => { setPaused(true); go(1); }}
          className="absolute right-[4%] top-1/2 hidden w-[180px] -translate-y-1/2 rotate-[9deg] cursor-pointer overflow-hidden rounded-[1.8rem] opacity-50 shadow-xl shadow-stone-950/15 transition-all duration-500 hover:rotate-[6deg] hover:opacity-80 md:block lg:right-[10%]"
        >
          <Image
            src={shots[next].src}
            alt={shots[next].title}
            width={780}
            height={1688}
            className="w-full"
          />
        </button>
      </div>

      {/* Caption */}
      <div className="mx-auto mt-10 h-14 max-w-md px-6 text-center">
        <div className="text-base font-semibold text-stone-950">{shots[active].title}</div>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">
          {shots[active].description}
        </p>
      </div>

      {/* Pill tabs */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 px-6">
        {shots.map((s, i) => (
          <button
            key={s.src}
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
