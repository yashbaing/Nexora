"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LabelBadge } from "@/components/ui";
import { api } from "@/lib/api";

type Event = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: string;
};

type State = {
  step: number;
  events: Event[];
  suppliers: any[] | null;
  negotiation: any | null;
  policy: any | null;
  demand: any | null;
};

const steps = [
  { key: "aggregate", label: "Aggregate", path: "/api/agent/aggregate" },
  { key: "research", label: "Research", path: "/api/agent/research" },
  { key: "negotiate", label: "Negotiate", path: "/api/agent/negotiate" },
  { key: "policy", label: "Policy", path: "/api/agent/policy" },
  { key: "settle", label: "Settle", path: "/api/agent/settle" },
  { key: "mint", label: "Mint RWA", path: "/api/agent/mint" },
];

export default function AgentPage() {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setState(await api("/api/agent/state"));
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  async function run(path: string) {
    setBusy(true);
    try {
      setState(await api(path, { method: "POST", body: "{}" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <LabelBadge>Screen 3 · Agent activity</LabelBadge>
      <h1 className="display mt-3 text-4xl">Procurement agent</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        LLM-assisted research and negotiation. Deterministic code enforces budgets, whitelist, expiry, FX, and funding.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button className="btn btn-ghost" disabled={busy} onClick={() => run("/api/agent/reset")}>
          Reset
        </button>
        {steps.map((s) => (
          <button key={s.key} className="btn btn-ghost" disabled={busy} onClick={() => run(s.path)}>
            {s.label}
          </button>
        ))}
        <button className="btn btn-primary" disabled={busy} onClick={() => run("/api/agent/run-demo")}>
          Run full demo
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <h2 className="display text-2xl">Timeline</h2>
          <div className="mt-6 space-y-0">
            <AnimatePresence initial={false}>
              {(state?.events || []).map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className="relative border-l border-[var(--line)] pl-5 pb-6"
                >
                  <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-[var(--brass)]" />
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{e.kind}</div>
                  <div className="mt-1 font-medium">{e.title}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{e.detail}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!state?.events?.length && (
              <p className="text-sm text-[var(--muted)]">No events yet — run the demo.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {state?.negotiation?.status === "accepted" && (
            <motion.div
              className="panel border-[var(--ok)]/30 p-6"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--ok)]">MOQ renegotiated</div>
              <div className="display mt-2 text-3xl">
                {state.negotiation.originalMOQ} → {state.negotiation.newMOQ}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                €{state.negotiation.offer.unitPriceEUR}/tin · {state.negotiation.offer.paymentCurrency} ·{" "}
                {state.negotiation.offer.paymentTiming} · recurring {state.negotiation.offer.recurringIntent}
              </p>
            </motion.div>
          )}

          {state?.suppliers && (
            <div className="panel p-6">
              <h3 className="display text-xl">Supplier comparison</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {state.suppliers.map((s: any) => (
                  <li key={s.supplierId} className="border-b border-[var(--line)] pb-3">
                    <div className="flex justify-between gap-3">
                      <span>{s.name}</span>
                      <span className="text-[var(--brass)]">€{s.unitPriceEUR}</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      MOQ {s.moq} · {s.deliveryDays}d · {s.paymentCurrency} · score {s.score.toFixed(1)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state?.policy && (
            <div className="panel p-6">
              <h3 className="display text-xl">Policy engine</h3>
              <p className={`mt-2 text-sm ${state.policy.ok ? "ok" : "bad"}`}>
                {state.policy.ok ? "All checks passed — execution allowed" : "Execution blocked"}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {state.policy.checks.map((c: any) => (
                  <li key={c.name} className="flex gap-2">
                    <span className={c.passed ? "ok" : "bad"}>{c.passed ? "✓" : "✗"}</span>
                    <span>
                      <span className="text-[var(--ink)]">{c.name}</span>
                      <span className="block text-xs text-[var(--muted)]">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
