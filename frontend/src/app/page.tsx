"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader, LabelBadge } from "@/components/ui";

const fade = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />

      {/* Hero — full-bleed olive grove / trade atmosphere */}
      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl grid-cols-1 items-end gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative z-10">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="mb-6">
            <LabelBadge>UAE × Spain · Arc Testnet</LabelBadge>
          </motion.div>
          <motion.h1
            className="display max-w-xl text-5xl leading-[1.05] text-[var(--ink)] sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            ArcMOQ
          </motion.h1>
          <motion.p
            className="mt-5 max-w-md text-lg leading-relaxed text-[var(--mist)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            Small buyers. Real inventory. One autonomous global order.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Link href="/app" className="btn btn-primary">
              Open live demo
            </Link>
            <Link href="/#how" className="btn btn-ghost">
              See the flow
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative min-h-[52vh] overflow-hidden lg:min-h-[70vh]"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(11,18,16,0.15) 0%, rgba(11,18,16,0.55) 55%, rgba(11,18,16,0.85) 100%), radial-gradient(circle at 30% 40%, rgba(196,165,116,0.2), transparent 45%), linear-gradient(135deg, #1c2e1f 0%, #0f1814 40%, #243528 70%, #3d4f2f 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, transparent 0 14px, rgba(232,226,208,0.03) 14px 15px), repeating-linear-gradient(20deg, transparent 0 28px, rgba(95,125,79,0.08) 28px 29px)",
            }}
          />
          <motion.div
            className="absolute bottom-8 left-8 right-8 border border-[var(--line)] bg-[rgba(11,18,16,0.55)] p-5 backdrop-blur-sm"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--brass)]">Demo shipment</div>
            <div className="display mt-2 text-3xl">Extra Virgin Olive Oil</div>
            <div className="mt-1 text-sm text-[var(--muted)]">Jaén, Spain · 5-liter tins · 860 pooled demand</div>
          </motion.div>
        </motion.div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="display text-4xl">How ArcMOQ works</h2>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          UAE restaurants, hotels, and grocers combine demand. An AI procurement agent negotiates MOQ and price,
          settles on Arc in USDC→EURC, then mints redeemable warehouse receipts after shipment verification.
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              t: "Pool demand",
              d: "Compatible buyer mandates aggregate until wholesale terms unlock — even below the supplier’s listed MOQ.",
            },
            {
              t: "Agent negotiates",
              d: "Structured counteroffers, not free-form chat. Deterministic policy checks budgets, whitelist, FX, and expiry.",
            },
            {
              t: "Settle & claim",
              d: "USDC pooled on Arc, EURC paid to Spain. Verified inventory becomes ERC-1155 receipts you redeem for goods.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-[var(--brass)] text-sm tracking-[0.2em] uppercase">0{i + 1}</div>
              <h3 className="display mt-3 text-2xl">{item.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="tracks" className="border-y border-[var(--line)] bg-[rgba(18,26,23,0.45)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <LabelBadge>Hackathon tracks</LabelBadge>
            <h2 className="display mt-4 text-4xl">Built for SME trade on Arc</h2>
            <p className="mt-4 max-w-md text-[var(--muted)]">
              Primary track: SME Trade Finance. Also RWA tokenization, agentic economy, and cross-border payments.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            {[
              ["SME Trade Finance", "Pool purchasing, lock funds, transparent allocation, refunds if the order fails."],
              ["RWA Tokenization", "Non-speculative warehouse receipts tied to shipment, batch, quantity, and buyer."],
              ["Agentic Economy", "Research, negotiate, and execute within mandate limits — never unrestricted funds."],
              ["Cross-Border Payments", "AED UX → USDC on Arc → adapter FX → EURC to Spanish supplier."],
            ].map(([title, body]) => (
              <li key={title} className="border-b border-[var(--line)] pb-4">
                <div className="font-medium text-[var(--brass-soft)]">{title}</div>
                <div className="mt-1 text-[var(--muted)]">{body}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="display text-4xl">What is real vs simulated</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {[
            ["Arc Settlement: Live Testnet", "GroupOrder, USDC pool, EURC payout, receipts, redemption"],
            ["StableFX: Test or Adapter Mode", "Clearly labeled FX adapter — not production RFQ liquidity"],
            ["AED Collection: Simulated PSP", "Buyer sees AED; no claim of AED→USDC via StableFX"],
            ["Supplier Quotes: Sandbox", "Three Spanish olive-oil supplier endpoints for the demo"],
            ["Warehouse Attestation: Demo Verifier", "AI extracts docs; trusted signer must attest before mint"],
          ].map(([title, body]) => (
            <div key={title} className="panel p-5">
              <div className="text-sm font-medium text-[var(--brass-soft)]">{title}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link href="/app" className="btn btn-primary">
            Run the olive oil demo
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-6 py-10 text-center text-xs text-[var(--muted)]">
        ArcMOQ · AI is the execution layer, not the asset verifier · Arc Testnet
      </footer>
    </main>
  );
}
