"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LabelBadge, Stat } from "@/components/ui";
import { api } from "@/lib/api";

export default function ReceiptPage() {
  const [state, setState] = useState<any>(null);
  const [extract, setExtract] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    setState(await api("/api/agent/state"));
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  async function extractDocs() {
    setBusy(true);
    try {
      setExtract(
        await api("/api/documents/extract", {
          method: "POST",
          body: JSON.stringify({
            text: "Commercial invoice + packing list + bill of lading for EVOO-ES-UAE-001, 860 tins, Jebel Ali",
          }),
        })
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyMint() {
    setBusy(true);
    try {
      setState(await api("/api/agent/mint", { method: "POST", body: "{}" }));
      setMessage("Warehouse attestation verified and receipts minted.");
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    setBusy(true);
    try {
      setState(
        await api("/api/agent/redeem", {
          method: "POST",
          body: JSON.stringify({ buyer: "Restaurant A", quantity: 100 }),
        })
      );
      setMessage("100 receipt units burned — 100 physical tins released to Restaurant A.");
    } finally {
      setBusy(false);
    }
  }

  const rwa = state?.rwa;
  const restaurant = rwa?.allocations?.find((a: any) => a.buyer === "Restaurant A");

  return (
    <div>
      <LabelBadge>Screen 5 · Inventory receipt</LabelBadge>
      <h1 className="display mt-3 text-4xl">Digital warehouse receipt</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        ERC-1155 claim on verified physical goods. Not a speculative asset. Burned on redemption.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <LabelBadge>Warehouse Attestation: Demo Verifier</LabelBadge>
        <LabelBadge>KYB transfers only</LabelBadge>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="btn btn-ghost" disabled={busy} onClick={extractDocs}>
          AI extract shipping docs
        </button>
        <button className="btn btn-primary" disabled={busy} onClick={verifyMint}>
          Attest & mint receipts
        </button>
        <button className="btn btn-ghost" disabled={busy || !rwa?.verified} onClick={redeem}>
          Redeem Restaurant A (100)
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-[var(--ok)]">{message}</p>}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="display text-2xl">Shipment batch</h2>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <Stat label="Batch ID" value={rwa?.batchId || "EVOO-ES-UAE-001"} />
            <Stat label="Quantity" value="860" hint="5L tins" />
            <Stat label="Verification" value={rwa?.verified ? "Verified" : "Pending"} />
            <Stat label="Shipment status" value={rwa?.verified ? "In bonded warehouse" : "Awaiting docs"} />
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
              <dt className="text-[var(--muted)]">Product</dt>
              <dd>Extra Virgin Olive Oil</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
              <dt className="text-[var(--muted)]">Origin</dt>
              <dd>Jaén, Spain</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
              <dt className="text-[var(--muted)]">Supplier</dt>
              <dd>Oliva Sur Cooperativa</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
              <dt className="text-[var(--muted)]">Warehouse</dt>
              <dd>Demo Jebel Ali Bonded</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
              <dt className="text-[var(--muted)]">Shipment ref</dt>
              <dd>{rwa?.shipmentRef || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          {extract && (
            <motion.div className="panel p-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--brass)]">{extract.label}</div>
              <pre className="mt-3 overflow-x-auto text-xs text-[var(--mist)]">
                {JSON.stringify(extract.extracted, null, 2)}
              </pre>
              <p className="mt-3 text-xs text-[var(--muted)]">{extract.warning}</p>
            </motion.div>
          )}

          <div className="panel p-6">
            <h2 className="display text-2xl">Allocations</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(rwa?.allocations || []).map((a: any) => (
                <li key={a.buyer} className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <span>{a.buyer}</span>
                  <span>
                    {a.quantity - a.redeemed} live / {a.redeemed} redeemed
                  </span>
                </li>
              ))}
              {!rwa?.allocations?.length && (
                <li className="text-[var(--muted)]">Settle the order first, then mint.</li>
              )}
            </ul>

            {restaurant && (
              <div className="mt-6 border border-[var(--line)] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--brass)]">Restaurant A claim</div>
                <div className="display mt-2 text-3xl">{restaurant.quantity - restaurant.redeemed} tins</div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Redemption burns receipt units 1:1 with physical release.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
