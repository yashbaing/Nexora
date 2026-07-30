"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ArrowDown, TrendingUp, Shield, Globe2 } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

const STATS = [
  { icon: TrendingUp, label: "Live equities", value: "12+" },
  { icon: Globe2, label: "On Avalanche", value: "Web3" },
  { icon: Shield, label: "On-chain settlement", value: "24/7" },
];

export function Hero() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    axios.get("/api/waitlist/count")
      .then((res) => {
        if (typeof res.data?.count === "number") {
          setWaitlistCount(res.data.count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 md:px-6 overflow-hidden">
      <div
        className="landing-gradient-orb w-[500px] h-[500px] -top-32 -left-32 bg-cyan-500/30"
        aria-hidden
      />
      <div
        className="landing-gradient-orb w-[400px] h-[400px] top-20 right-0 bg-violet-600/25"
        aria-hidden
      />
      <div className="absolute inset-0 landing-grid-bg pointer-events-none" aria-hidden />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full landing-glass text-sm text-cyan-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            Early access opening soon
            {waitlistCount !== null && waitlistCount > 0
              ? ` — ${waitlistCount.toLocaleString()} on the waitlist`
              : " — join the waitlist"}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl">
            Trade{" "}
            <span className="landing-gradient-text">tokenized stocks</span>
            <br />
            like never before
          </h1>

          <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Tokenssized brings Apple, Tesla, NVIDIA and global equities on-chain.
            Real-time prices, instant settlement, and a trading experience built for the next generation.
          </p>

          <div className="mt-10 w-full flex justify-center">
            <WaitlistForm variant="hero" onSuccess={(c) => setWaitlistCount(c)} />
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 md:gap-12 max-w-lg md:max-w-2xl w-full">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-cyan-400/80" />
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs md:text-sm text-zinc-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <a
            href="#features"
            className="mt-16 flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <span>Discover more</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
