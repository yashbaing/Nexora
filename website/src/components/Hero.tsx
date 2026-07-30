"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import WaitlistForm from "./WaitlistForm";
import LiveWaitlistCount from "./LiveWaitlistCount";
import BackgroundFX from "./BackgroundFX";

const FLOAT_CARDS = [
  { symbol: "xAAPL", price: "$314.96", change: "+1.24%", up: true, top: "12%", left: "2%", delay: 0.2 },
  { symbol: "xNVDA", price: "$207.40", change: "+3.87%", up: true, top: "62%", left: "-2%", delay: 0.5 },
  { symbol: "xTSLA", price: "$393.99", change: "-2.31%", up: false, top: "6%", left: "78%", delay: 0.35 },
  { symbol: "xMETA", price: "$660.31", change: "+2.18%", up: true, top: "68%", left: "80%", delay: 0.65 },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-48">
      <BackgroundFX />

      {/* Floating price cards — desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {FLOAT_CARDS.map((card) => (
          <motion.div
            key={card.symbol}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: [0, -14, 0] }}
            transition={{
              opacity: { duration: 0.8, delay: card.delay },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: card.delay },
            }}
            className="glass-card absolute w-[168px] rounded-2xl px-4 py-3 shadow-2xl"
            style={{ top: card.top, left: card.left }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-white/70">{card.symbol}</span>
              <span
                className={`pulse-dot h-1.5 w-1.5 rounded-full ${
                  card.up ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
            </div>
            <p className="font-mono-num mt-1.5 text-lg font-semibold text-white">{card.price}</p>
            <p className={`font-mono-num text-xs font-medium ${card.up ? "text-emerald-400" : "text-rose-400"}`}>
              {card.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1.5 text-xs font-medium text-violet-200"
        >
          <Sparkles size={13} />
          Live on Avalanche Fuji Testnet — mainnet waitlist now open
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl"
        >
          Own the world&apos;s top stocks.
          <br />
          <span className="gradient-text">On-chain. Instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          Nexora turns Apple, Tesla, NVIDIA and more into fractional, self-custody
          tokens you can trade 24/7 — with sub-2-second settlement on Avalanche.
          No brokers. No market hours. No middlemen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 w-full max-w-md"
        >
          <WaitlistForm size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6"
        >
          <LiveWaitlistCount />
        </motion.div>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          href="https://testnet.snowtrace.io/address/0xf4d581d6974EDF49a8695D1a1aA3834FaB35D0ec"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/40 transition-colors hover:text-white/70"
        >
          Built on Avalanche C-Chain · verify the contracts
          <ArrowUpRight size={15} />
        </motion.a>
      </div>
    </section>
  );
}
