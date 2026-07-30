"use client";

import { motion } from "framer-motion";

/** Decorative phone mockup showing app preview in hero area */
export function AppPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[320px] landing-float"
      aria-hidden
    >
      <div className="relative mx-auto w-[280px] h-[580px] rounded-[36px] border-[6px] border-zinc-800 bg-[#0a0a12] shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-8 bg-black/40 flex items-center justify-center">
          <div className="w-20 h-4 rounded-full bg-black" />
        </div>
        <div className="p-4 pt-10 space-y-3">
          <div className="text-xs text-zinc-500 font-medium">Portfolio</div>
          <div className="text-2xl font-bold">$24,842.50</div>
          <div className="text-xs text-emerald-400">+12.4% this month</div>
          <div className="h-24 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/10 border border-white/5 mt-4 flex items-end p-3 gap-1">
            {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500 to-violet-400 opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="space-y-2 mt-4">
            {[
              { sym: "xAAPL", val: "+2.1%", pos: true },
              { sym: "xNVDA", val: "+3.8%", pos: true },
              { sym: "xTSLA", val: "-0.4%", pos: false },
            ].map((row) => (
              <div
                key={row.sym}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/[0.03] text-sm"
              >
                <span className="font-mono text-cyan-300/80">{row.sym}</span>
                <span className={row.pos ? "text-emerald-400" : "text-red-400"}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
