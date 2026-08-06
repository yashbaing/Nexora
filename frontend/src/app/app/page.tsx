"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LabelBadge, Stat } from "@/components/ui";
import { api } from "@/lib/api";

type Order = {
  id: number;
  product: string;
  origin: string;
  packaging: string;
  currentDemand: number;
  supplierMOQ: number;
  businesses: number;
  estimatedSavingsPct: number;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ orders: Order[] }>("/api/orders")
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <LabelBadge>Screen 1 · Active group orders</LabelBadge>
          <h1 className="display mt-3 text-4xl">UAE pooled demand</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Multiple SMEs combine orders to reach Spanish supplier wholesale terms.
          </p>
        </div>
        <Link href="/app/mandate" className="btn btn-primary">
          Create mandate
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-[var(--danger)]">
          API offline ({error}). Start the backend on :5001.
        </p>
      )}

      <div className="mt-10 space-y-6">
        {orders.map((o, i) => (
          <motion.article
            key={o.id}
            className="panel overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
              <div className="relative min-h-[220px] p-6 lg:p-8">
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a2a1c 0%, #243528 45%, #4a5e3a 100%)",
                  }}
                />
                <div className="relative">
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--brass)]">{o.origin}</div>
                  <h2 className="display mt-2 text-3xl sm:text-4xl">{o.product}</h2>
                  <p className="mt-2 text-sm text-[var(--mist)]">{o.packaging}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <LabelBadge>{o.status}</LabelBadge>
                    <LabelBadge>Supplier Quotes: Sandbox</LabelBadge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-[var(--line)] p-6 lg:border-l lg:border-t-0 lg:p-8">
                <Stat label="Current demand" value={`${o.currentDemand}`} hint="tins pooled" />
                <Stat label="Supplier MOQ" value={`${o.supplierMOQ}`} hint="needs negotiation" />
                <Stat label="UAE businesses" value={`${o.businesses}`} />
                <Stat label="Est. wholesale savings" value={`${o.estimatedSavingsPct}%`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-[var(--line)] px-6 py-4">
              <Link href="/app/agent" className="btn btn-primary">
                Run AI agent
              </Link>
              <Link href="/app/settlement" className="btn btn-ghost">
                Settlement
              </Link>
              <Link href="/app/receipt" className="btn btn-ghost">
                Inventory receipt
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
