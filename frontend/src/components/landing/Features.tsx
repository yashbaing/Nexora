"use client";

import { motion } from "framer-motion";
import {
  Bolt,
  ChartLine,
  Lock,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: ChartLine,
    title: "Real-time market data",
    description:
      "Live price feeds and charts powered by institutional-grade data. Track every move as markets move.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-400",
  },
  {
    icon: Bolt,
    title: "Instant on-chain trades",
    description:
      "Buy and sell tokenized equities with sub-second settlement on Avalanche. No T+2 waiting.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-400",
  },
  {
    icon: Wallet,
    title: "Web3-native wallet",
    description:
      "Connect MetaMask or sign in with Google for an embedded wallet. Your keys, your portfolio.",
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Lock,
    title: "Signed trade quotes",
    description:
      "EIP-712 signed quotes from our oracle ensure fair pricing and tamper-proof execution.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: Smartphone,
    title: "Mobile-first design",
    description:
      "Trade from anywhere with a beautiful interface optimized for phones, tablets, and desktop.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Global equities",
    description:
      "US blue chips and Indian ADR-style tokens — xAAPL, xTSLA, xRELI, xTCS and more in one app.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-400",
  },
];

export function Features() {
  return (
    <section id="features" className="landing-section">
      <div className="text-center mb-14">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-3"
        >
          Why Tokenssized
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Everything you need to trade the future
        </motion.h2>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          We&apos;re merging traditional equities with DeFi speed — without sacrificing the experience traders expect.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="landing-glass rounded-2xl p-6 hover:border-white/15 transition-colors group"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
            >
              <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
