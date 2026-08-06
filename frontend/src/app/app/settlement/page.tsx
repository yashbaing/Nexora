"use client";

import { useEffect, useState } from "react";
import { LabelBadge, Stat } from "@/components/ui";
import { api, ARC, explorerTx, shortAddr } from "@/lib/api";

export default function SettlementPage() {
  const [config, setConfig] = useState<any>(null);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    Promise.all([api("/api/config"), api("/api/agent/state")]).then(([c, s]) => {
      setConfig(c);
      setState(s);
    });
  }, []);

  const settlement = state?.settlement;
  const contracts = config?.contracts || {};
  const tx = state?.tx?.settlement;

  return (
    <div>
      <LabelBadge>Screen 4 · Settlement</LabelBadge>
      <h1 className="display mt-3 text-4xl">USDC pool → EURC payout</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Buyers see AED. Settlement runs on Arc: pooled USDC converts through the StableFX adapter and pays the
        Spanish supplier in EURC.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <LabelBadge>AED Collection: Simulated PSP</LabelBadge>
        <LabelBadge>
          Arc Settlement: {contracts.labels?.arcSettlement || "Arc Testnet"}
        </LabelBadge>
        <LabelBadge>StableFX: Test or Adapter Mode</LabelBadge>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5">
          <Stat label="Total pooled USDC" value={settlement ? settlement.usdcNeeded.toLocaleString() : "—"} hint="required for settlement" />
        </div>
        <div className="panel p-5">
          <Stat label="EURC paid" value={settlement ? settlement.totalEURC.toLocaleString() : "—"} hint="to supplier wallet" />
        </div>
        <div className="panel p-5">
          <Stat label="FX quote" value={settlement ? String(settlement.fxRate) : "—"} hint="EURC per USDC (adapter)" />
        </div>
        <div className="panel p-5">
          <Stat label="FX fee" value={settlement ? `${settlement.fxFeeBps} bps` : "—"} hint={`≈ €${settlement?.fxFeeEUR ?? "—"}`} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="display text-2xl">Payment path</h2>
          <ol className="mt-6 space-y-4 text-sm">
            {[
              "UAE buyers authorize AED amounts via simulated local PSP",
              "Equivalent USDC deposits into ArcMOQ GroupOrder",
              "Agent accepts Oliva Sur offer after policy checks",
              "StableFX adapter converts USDC → EURC",
              "Spanish supplier receives EURC; unused authorization released",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 border-b border-[var(--line)] pb-3">
                <span className="text-[var(--brass)]">0{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-[var(--muted)]">
            ArcMOQ does not claim StableFX converts AED into USDC.
          </p>
        </div>

        <div className="panel p-6">
          <h2 className="display text-2xl">Onchain references</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Network</dt>
              <dd>{ARC.name} ({ARC.chainId})</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">GroupOrder</dt>
              <dd className="font-mono text-xs">{shortAddr(contracts.GroupOrder)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">StableFXAdapter</dt>
              <dd className="font-mono text-xs">{shortAddr(contracts.StableFXAdapter)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">USDC</dt>
              <dd className="font-mono text-xs">{shortAddr(contracts.USDC || ARC.USDC)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">EURC</dt>
              <dd className="font-mono text-xs">{shortAddr(contracts.EURC || ARC.EURC)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Supplier wallet</dt>
              <dd className="font-mono text-xs">{shortAddr(contracts.supplierWallet)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Settlement status</dt>
              <dd className={state?.step >= 5 ? "ok" : "warn"}>
                {state?.step >= 5 ? "Supplier paid" : "Awaiting agent execution"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Arc tx</dt>
              <dd>
                {tx ? (
                  <a className="text-[var(--brass)] underline" href={explorerTx(tx)!} target="_blank" rel="noreferrer">
                    View on ArcScan
                  </a>
                ) : (
                  <span className="text-[var(--muted)]">Run agent settle with live tx hash</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {state?.policy?.perBuyerAED && (
        <div className="panel mt-8 overflow-x-auto p-6">
          <h2 className="display text-2xl">Buyer settlement receipts (AED view)</h2>
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="py-2">Buyer</th>
                <th>Qty</th>
                <th>Final cost</th>
                <th>Max authorized</th>
                <th>Released</th>
              </tr>
            </thead>
            <tbody>
              {state.policy.perBuyerAED.map((b: any) => (
                <tr key={b.id} className="border-t border-[var(--line)]">
                  <td className="py-3">{b.name}</td>
                  <td>{b.quantity}</td>
                  <td>AED {b.estimatedCostAED.toLocaleString()}</td>
                  <td>AED {b.maxAuthorizedAED.toLocaleString()}</td>
                  <td className="ok">
                    AED {(b.maxAuthorizedAED - b.estimatedCostAED).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
