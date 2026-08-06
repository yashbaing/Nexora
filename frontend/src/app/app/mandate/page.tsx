"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { LabelBadge } from "@/components/ui";
import { api } from "@/lib/api";

export default function MandatePage() {
  const [form, setForm] = useState({
    name: "Restaurant A",
    quantity: 100,
    maxBudgetAED: 15000,
    quality: "Extra Virgin",
    deliveryDeadline: "2026-09-30",
    maxPriceVariancePct: 2,
    allowAutonomous: true,
  });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api("/api/mandates", { method: "POST", body: JSON.stringify(form) });
      setResult(data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <LabelBadge>Screen 2 · Create buying mandate</LabelBadge>
      <h1 className="display mt-3 text-4xl">Authorize within limits</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        The agent may execute only inside this mandate. Over-budget offers require additional approval.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="panel space-y-5 p-6">
          {(
            [
              ["name", "Business name", "text"],
              ["quantity", "Quantity (tins)", "number"],
              ["maxBudgetAED", "Maximum budget (AED)", "number"],
              ["quality", "Required quality", "text"],
              ["deliveryDeadline", "Delivery deadline", "date"],
              ["maxPriceVariancePct", "Max price variance (%)", "number"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
              <input
                type={type}
                className="mt-2 w-full border border-[var(--line)] bg-[rgba(0,0,0,0.25)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brass)]"
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            </label>
          ))}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.allowAutonomous}
              onChange={(e) => setForm((f) => ({ ...f, allowAutonomous: e.target.checked }))}
            />
            Allow autonomous execution within budget
          </label>
          <div className="pt-2">
            <LabelBadge>AED Collection: Simulated PSP</LabelBadge>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Submit mandate"}
          </button>
        </div>

        <motion.div
          className="panel p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="display text-2xl">Preview</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Product</dt>
              <dd>Extra Virgin Olive Oil · 5L tins</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Quantity</dt>
              <dd>{form.quantity} tins</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Estimated cost</dt>
              <dd>AED {Math.round(form.quantity * 38.1 * 3.7).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Maximum authorized</dt>
              <dd>AED {form.maxBudgetAED.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Autonomous</dt>
              <dd className={form.allowAutonomous ? "ok" : "warn"}>
                {form.allowAutonomous ? "Yes — within limits" : "Manual approval required"}
              </dd>
            </div>
          </dl>
          {result && (
            <p className="mt-6 text-sm text-[var(--ok)]">{result.message}</p>
          )}
        </motion.div>
      </form>
    </div>
  );
}
