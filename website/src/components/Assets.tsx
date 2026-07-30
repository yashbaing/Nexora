"use client";

import { motion } from "framer-motion";
import { TOKENIZED_ASSETS } from "@/lib/data";
import Reveal from "./Reveal";

export default function Assets() {
  return (
    <section id="assets" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Supported assets
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Global equities, tokenized and tradable
        </h2>
        <p className="mt-4 text-white/55">
          US tech giants to Indian blue chips — with dozens more assets on the way as we scale toward mainnet.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TOKENIZED_ASSETS.map((asset, i) => {
          const up = asset.changePercent >= 0;
          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              whileHover={{ y: -4 }}
              className="glass-card group flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{asset.symbol}</p>
                  <p className="mt-0.5 text-xs text-white/40">{asset.name}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50">
                  {asset.region}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-mono-num text-lg font-semibold text-white">
                  {asset.region === "IN" ? "₹" : "$"}
                  {asset.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`font-mono-num text-xs font-semibold ${
                    up ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {up ? "▲" : "▼"} {up ? "+" : ""}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-white/30">{asset.sector}</span>
            </motion.div>
          );
        })}
      </div>

      <Reveal className="mt-10 text-center">
        <p className="text-sm text-white/40">
          + 500 more equities, ETFs and indices planned post-mainnet launch
        </p>
      </Reveal>
    </section>
  );
}
