"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft, LineChart, Rocket, Wallet } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect your wallet",
    description: "Link MetaMask or sign in with Google to get an embedded Web3 wallet in seconds.",
  },
  {
    step: "02",
    icon: LineChart,
    title: "Browse live markets",
    description: "Explore tokenized stocks with real-time prices, charts, and market depth.",
  },
  {
    step: "03",
    icon: ArrowRightLeft,
    title: "Trade with one tap",
    description: "Get a signed quote, confirm in your wallet, and own on-chain equity instantly.",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Track your portfolio",
    description: "Monitor holdings, P&L, and history — all synced from the blockchain.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section relative">
      <div className="absolute inset-0 landing-grid-bg opacity-50 pointer-events-none" aria-hidden />

      <div className="relative">
        <div className="text-center mb-14">
          <p className="text-violet-400 text-sm font-medium tracking-wide uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From signup to first trade in minutes
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[calc(100%+12px)] w-[calc(100%-48px)] h-px bg-gradient-to-r from-cyan-500/40 to-transparent"
                  aria-hidden
                />
              )}
              <div className="landing-glass rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-cyan-400/80">{item.step}</span>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
