"use client";

import { motion } from "framer-motion";

const STOCKS = [
  { sym: "xAAPL", name: "Apple Inc.", sector: "Technology", color: "#555555" },
  { sym: "xTSLA", name: "Tesla Inc.", sector: "Automotive", color: "#cc0000" },
  { sym: "xNVDA", name: "NVIDIA Corp.", sector: "Semiconductors", color: "#76b900" },
  { sym: "xMSFT", name: "Microsoft", sector: "Technology", color: "#00a4ef" },
  { sym: "xGOOGL", name: "Alphabet", sector: "Technology", color: "#4285f4" },
  { sym: "xAMZN", name: "Amazon", sector: "E-commerce", color: "#ff9900" },
  { sym: "xMETA", name: "Meta Platforms", sector: "Social", color: "#0668e1" },
  { sym: "xRELI", name: "Reliance Industries", sector: "Conglomerate", color: "#1e3a8a" },
  { sym: "xTCS", name: "Tata Consultancy", sector: "IT Services", color: "#0d9488" },
  { sym: "xJPM", name: "JPMorgan Chase", sector: "Finance", color: "#117aca" },
  { sym: "xKO", name: "Coca-Cola", sector: "Consumer", color: "#f40009" },
  { sym: "xINFY", name: "Infosys", sector: "IT Services", color: "#007cc3" },
];

export function StockGrid() {
  return (
    <section id="stocks" className="landing-section">
      <div className="text-center mb-12">
        <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase mb-3">
          Markets
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Trade the names you already know
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
          Each token is backed 1:1 by our on-chain platform — real equities exposure, Web3 infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {STOCKS.map((stock, i) => (
          <motion.div
            key={stock.sym}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="landing-glass rounded-xl p-4 cursor-default group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: stock.color }}
              >
                {stock.sym.replace("x", "").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs text-cyan-300">{stock.sym}</div>
                <div className="text-sm font-medium truncate">{stock.name}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">{stock.sector}</div>
            <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                initial={{ width: "30%" }}
                whileInView={{ width: `${40 + (i % 5) * 12}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
