"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const screens = [
  {
    src: "/screens/home.png",
    title: "Your wealth, on-chain",
    description: "Total portfolio value, top movers, and full on-chain history — one glance.",
  },
  {
    src: "/screens/markets.png",
    title: "Markets that never sleep",
    description: "Live tokenized equity quotes streamed from Hyperliquid, 24/7.",
  },
  {
    src: "/screens/stock.png",
    title: "Charts built for conviction",
    description: "Real-time candlesticks, token stats, and day ranges for every stock.",
  },
  {
    src: "/screens/trade.png",
    title: "Trade in one tap",
    description: "Oracle-signed quotes settle your buy or sell on-chain in seconds.",
  },
  {
    src: "/screens/wallet.png",
    title: "USDC in your control",
    description: "Self-custody settlement balance with a built-in testnet faucet.",
  },
];

const AUTO_MS = 3800;

export default function AppScreens() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + screens.length) % screens.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Deck of phone screens */}
      <div className="relative h-[560px] w-[260px] md:h-[620px] md:w-[290px]" style={{ perspective: "1200px" }}>
        {screens.map((s, i) => {
          // Signed circular distance from the active card, so the deck wraps around
          let off = i - index;
          if (off > screens.length / 2) off -= screens.length;
          if (off < -screens.length / 2) off += screens.length;
          const abs = Math.abs(off);
          const visible = abs <= 2;
          return (
            <div
              key={s.src}
              aria-hidden={i !== index}
              className="absolute inset-0 rounded-[2.5rem] border-[6px] border-stone-950 bg-stone-950 shadow-2xl shadow-stone-950/25 transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${off * 46}px) scale(${1 - abs * 0.09}) rotateY(${off * -7}deg)`,
                zIndex: 10 - abs,
                opacity: visible ? 1 - abs * 0.28 : 0,
                pointerEvents: i === index ? "auto" : "none",
              }}
            >
              <Image
                src={s.src}
                alt={s.title}
                width={780}
                height={1688}
                priority={i === 0}
                className="h-full w-full rounded-[2.1rem] object-cover object-top"
              />
            </div>
          );
        })}

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous screen"
          onClick={() => { setPaused(true); go(-1); }}
          className="absolute -left-16 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/90 p-2.5 text-stone-950 shadow-lg backdrop-blur transition hover:bg-stone-950 hover:text-white md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next screen"
          onClick={() => { setPaused(true); go(1); }}
          className="absolute -right-16 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/90 p-2.5 text-stone-950 shadow-lg backdrop-blur transition hover:bg-stone-950 hover:text-white md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Caption */}
      <div className="mt-7 h-16 max-w-xs text-center">
        <div className="text-base font-semibold text-stone-950">{screens[index].title}</div>
        <p className="mt-1 text-sm leading-relaxed text-stone-500">{screens[index].description}</p>
      </div>

      {/* Dots + mobile arrows */}
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          aria-label="Previous screen"
          onClick={() => { setPaused(true); go(-1); }}
          className="flex items-center justify-center rounded-full border border-stone-200 bg-white p-1.5 text-stone-600 transition hover:text-stone-950 md:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Go to ${s.title}`}
              onClick={() => { setPaused(true); setIndex(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-stone-950" : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next screen"
          onClick={() => { setPaused(true); go(1); }}
          className="flex items-center justify-center rounded-full border border-stone-200 bg-white p-1.5 text-stone-600 transition hover:text-stone-950 md:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
