"use client";

"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Boxes,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Play,
  Receipt,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { api, DEMO_BUYERS, fmtAED, fmtEURC, fmtUSDC, shortAddr } from "@/lib/api";

export type Tab = "orders" | "mandate" | "agent" | "settlement" | "receipt";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "orders", label: "Group Orders", icon: <Boxes size={16} /> },
  { id: "mandate", label: "Mandate", icon: <Wallet size={16} /> },
  { id: "agent", label: "Agent", icon: <Activity size={16} /> },
  { id: "settlement", label: "Settlement", icon: <Shield size={16} /> },
  { id: "receipt", label: "Receipt", icon: <Receipt size={16} /> },
];

export default function AppShell({ initialTab = "orders" }: { initialTab?: Tab }) {
  const router = useRouter();
  const tab = initialTab;
  const setTab = (t: Tab) => router.push(t === "orders" ? "/app" : `/app?tab=${t}`);
  const [config, setConfig] = useState<any>(null);
  const [state, setState] = useState<any>({ status: "idle", events: [], txs: [] });
  const [running, setRunning] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [mandate, setMandate] = useState({
    quantity: 100,
    maxAED: 15000,
    quality: "Extra Virgin",
    deadline: "2026-09-30",
    variance: 2,
    autonomous: true,
    business: "Restaurant A",
  });

  const refresh = useCallback(async () => {
    try {
      const [cfg, st] = await Promise.all([api("/api/config"), api("/api/demo/state")]);
      setConfig(cfg);
      setState(st);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  const runDemo = async () => {
    setRunning(true);
    setError("");
    setRedeemResult(null);
    setTab("agent");
    try {
      const st = await api("/api/demo/run", { method: "POST" });
      setState(st);
      if (st.status === "error") setError(st.error || "Demo failed");
      else setTab("settlement");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
      refresh();
    }
  };

  const redeem = async () => {
    setRedeeming(true);
    setError("");
    try {
      const r = await api("/api/demo/redeem", { method: "POST", body: JSON.stringify({ quantity: 100 }) });
      setRedeemResult(r);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRedeeming(false);
    }
  };

  const events = state.events || [];
  const settlement = state.settlement;
  const receipt = state.receipt;

  const savingsPct = useMemo(() => 18, []);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--foam)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0.9rem 1.25rem",
          borderBottom: "1px solid var(--line)",
          background: "rgba(247,243,235,0.9)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{ fontFamily: "var(--font-display), serif", fontWeight: 600, fontSize: 20, letterSpacing: "-0.03em" }}>
            ArcMOQ
          </Link>
          <span className="label-pill" style={{ display: "none" }} />
          {config && (
            <span className="label-pill">
              {config.labels?.arcSettlement || "Testnet"} · chain {config.chainId}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={runDemo}
          disabled={running}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: running ? "var(--ink-soft)" : "var(--ink)",
            color: "var(--foam)",
            border: "none",
            padding: "0.7rem 1rem",
            fontWeight: 650,
            cursor: running ? "wait" : "pointer",
          }}
        >
          {running ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
          {running ? "Agent executing…" : "Run full demo"}
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 220,
            borderRight: "1px solid var(--line)",
            padding: "1rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: "rgba(255,255,255,0.35)",
          }}
          className="desktop-nav"
        >
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === "orders" ? "/app" : `/app?tab=${t.id}`}
              data-testid={`tab-${t.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.7rem 0.85rem",
                border: "none",
                background: tab === t.id ? "var(--ink)" : "transparent",
                color: tab === t.id ? "var(--foam)" : "var(--ink-soft)",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: tab === t.id ? 600 : 500,
                fontSize: 14,
              }}
            >
              {t.icon}
              {t.label}
            </Link>
          ))}
          <div style={{ marginTop: "auto", padding: "0.75rem", fontSize: 11, color: "var(--label)", lineHeight: 1.45 }}>
            AI is the execution layer — warehouse attestation verifies inventory.
          </div>
        </aside>

        <main className="scroll-thin" style={{ flex: 1, overflow: "auto", padding: "1.5rem 1.25rem 5rem" }}>
          {error && (
            <div style={{ background: "rgba(159,18,57,0.08)", border: "1px solid rgba(159,18,57,0.25)", padding: "0.85rem 1rem", marginBottom: "1rem", fontSize: 14 }}>
              {error}
            </div>
          )}

          {tab === "orders" && (
            <section>
              <h1 style={h1}>Active group orders</h1>
              <p style={sub}>Spanish EVOO pooled by UAE SMEs on Arc.</p>
              <div style={panel}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display), serif", fontSize: 28, letterSpacing: "-0.03em" }}>Extra Virgin Olive Oil</div>
                    <div style={{ color: "var(--label)", marginTop: 4 }}>Jaén, Spain · 5-liter tins</div>
                  </div>
                  <StatusChip status={state.status === "complete" ? "Settled" : state.status === "running" ? "Negotiating" : "Open"} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.25rem", marginTop: "1.75rem" }}>
                  <Metric label="Current demand" value="860 tins" />
                  <Metric label="Supplier MOQ" value="1,000 → 860" hint="MOQ renegotiated" />
                  <Metric label="UAE businesses" value="5" />
                  <Metric label="Est. wholesale savings" value={`${savingsPct}%`} />
                </div>
                <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DEMO_BUYERS.map((b) => (
                    <span key={b.name} className="label-pill">{b.name}: {b.qty}</span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "mandate" && (
            <section>
              <h1 style={h1}>Create buying mandate</h1>
              <p style={sub}>Authorize the agent only within these limits. AED-facing — no chain jargon required.</p>
              <div style={{ ...panel, maxWidth: 560 }}>
                <Field label="Business">
                  <input value={mandate.business} onChange={(e) => setMandate({ ...mandate, business: e.target.value })} style={input} />
                </Field>
                <Field label="Quantity (5L tins)">
                  <input type="number" value={mandate.quantity} onChange={(e) => setMandate({ ...mandate, quantity: Number(e.target.value) })} style={input} />
                </Field>
                <Field label="Maximum budget (AED)">
                  <input type="number" value={mandate.maxAED} onChange={(e) => setMandate({ ...mandate, maxAED: Number(e.target.value) })} style={input} />
                </Field>
                <Field label="Quality">
                  <select value={mandate.quality} onChange={(e) => setMandate({ ...mandate, quality: e.target.value })} style={input}>
                    <option>Extra Virgin</option>
                    <option>Virgin</option>
                  </select>
                </Field>
                <Field label="Delivery deadline">
                  <input type="date" value={mandate.deadline} onChange={(e) => setMandate({ ...mandate, deadline: e.target.value })} style={input} />
                </Field>
                <Field label="Max price variance (%)">
                  <input type="number" value={mandate.variance} onChange={(e) => setMandate({ ...mandate, variance: Number(e.target.value) })} style={input} />
                </Field>
                <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={mandate.autonomous} onChange={(e) => setMandate({ ...mandate, autonomous: e.target.checked })} />
                  Allow autonomous execution within budget
                </label>
                <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(107,143,113,0.12)", fontSize: 13, lineHeight: 1.5 }}>
                  Example: {mandate.quantity} tins · max {fmtAED(mandate.maxAED)} · estimated ~{fmtAED(Math.round(mandate.quantity * 38.1 * 3.6725))} at €38.10 after adapter FX.
                  <div style={{ marginTop: 8 }} className="label-pill">AED Collection: Simulated PSP</div>
                </div>
              </div>
            </section>
          )}

          {tab === "agent" && (
            <section>
              <h1 style={h1}>Agent activity</h1>
              <p style={sub}>Research → match → negotiate → policy → execute. Deterministic gates before every chain tx.</p>
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                <button type="button" onClick={runDemo} disabled={running} style={secondaryBtn}>
                  {running ? <Loader2 size={14} /> : <RefreshCw size={14} />} {running ? "Running" : "Re-run"}
                </button>
              </div>
              <div style={panel}>
                {events.length === 0 && (
                  <p style={{ color: "var(--label)", margin: 0 }}>No agent events yet. Run the full demo to watch MOQ renegotiation.</p>
                )}
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {events.map((ev: any, i: number) => (
                    <li key={ev.id || i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 14, padding: "0.85rem 0", borderBottom: i < events.length - 1 ? "1px solid var(--line)" : "none" }}>
                      <div style={{ paddingTop: 6 }}><div className="timeline-dot" /></div>
                      <div>
                        <div style={{ fontWeight: 650, fontSize: 14 }}>{ev.title}</div>
                        <div style={{ fontSize: 13, color: "var(--label)", marginTop: 4, lineHeight: 1.45 }}>{ev.detail}</div>
                        <div style={{ fontSize: 11, color: "var(--leaf)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{ev.type}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {tab === "settlement" && (
            <section>
              <h1 style={h1}>Settlement</h1>
              <p style={sub}>USDC pooled on Arc → StableFX Adapter → EURC to Spanish supplier.</p>
              {!settlement ? (
                <div style={panel}><p style={{ margin: 0, color: "var(--label)" }}>Run the demo to execute on-chain settlement.</p></div>
              ) : (
                <div style={panel}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
                    <span className="label-pill">Arc Settlement: {settlement.labels?.arcSettlement}</span>
                    <span className="label-pill">{settlement.fx?.mode}</span>
                    <span className="label-pill">AED Collection: Simulated PSP</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.25rem" }}>
                    <Metric label="Pooled USDC" value={fmtUSDC(settlement.pooledUSDC)} />
                    <Metric label="EURC paid" value={fmtEURC(settlement.eurcPaid)} />
                    <Metric label="Unit price" value={`€${settlement.unitPriceEUR}`} />
                    <Metric label="Quantity" value={`${settlement.quantity} tins`} />
                    <Metric label="MOQ" value={`${settlement.originalMOQ} → ${settlement.renegotiatedMOQ}`} />
                    <Metric label="Supplier" value={shortAddr(settlement.supplier)} hint={settlement.supplierName} />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--label)", marginTop: "1.25rem" }}>
                    {settlement.fx?.note}
                  </p>
                  <h3 style={{ margin: "1.75rem 0 0.75rem", fontSize: 15 }}>Arc transactions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(state.txs || []).slice(-12).map((tx: any) => (
                      <div key={tx.hash + tx.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "0.55rem 0", borderBottom: "1px solid var(--line)" }}>
                        <span>{tx.label}</span>
                        {tx.explorer ? (
                          <a href={tx.explorer} target="_blank" rel="noreferrer" style={{ color: "var(--leaf)", fontFamily: "ui-monospace, monospace" }}>{shortAddr(tx.hash)}</a>
                        ) : (
                          <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--label)" }}>{shortAddr(tx.hash)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "receipt" && (
            <section>
              <h1 style={h1}>Inventory receipt</h1>
              <p style={sub}>ERC-1155 warehouse receipts minted only after demo verifier attestation.</p>
              {!receipt ? (
                <div style={panel}><p style={{ margin: 0, color: "var(--label)" }}>Complete settlement and attestation to mint receipts.</p></div>
              ) : (
                <div style={panel}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display), serif", fontSize: 26 }}>{receipt.batchCode}</div>
                      <div style={{ color: "var(--label)", marginTop: 4 }}>{receipt.productName} · {receipt.origin}</div>
                    </div>
                    <StatusChip status={receipt.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                    <Metric label="Packaging" value={receipt.packaging} />
                    <Metric label="Supplier" value={receipt.supplier} />
                    <Metric label="Minted" value={`${receipt.mintedQuantity} / ${receipt.totalQuantity}`} />
                    <Metric label="Attestation" value={shortAddr(receipt.attestationHash)} hint="Demo Verifier" />
                  </div>
                  <h3 style={{ margin: "1.75rem 0 0.75rem", fontSize: 15 }}>Allocations</h3>
                  {(receipt.allocations || []).map((a: any) => (
                    <div key={a.buyer} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
                      <span>{a.name || shortAddr(a.buyer)}</span>
                      <span style={{ fontFamily: "ui-monospace, monospace" }}>{a.quantity} units · redeemed {a.redeemed || 0}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={redeem}
                    disabled={redeeming || state.status !== "complete"}
                    style={{ ...primaryBtn, marginTop: "1.5rem" }}
                  >
                    {redeeming ? <Loader2 size={16} /> : <FileCheck2 size={16} />}
                    Redeem Restaurant A · 100 tins
                  </button>
                  {redeemResult?.burned && (
                    <div style={{ marginTop: "1rem", display: "flex", gap: 8, alignItems: "center", color: "var(--ok)", fontSize: 14 }}>
                      <CheckCircle2 size={18} />
                      Burned {redeemResult.quantity} receipt units — physical tins released.
                      {redeemResult.explorer && (
                        <a href={redeemResult.explorer} target="_blank" rel="noreferrer" style={{ color: "var(--leaf)" }}>View tx</a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "none",
          background: "rgba(247,243,235,0.95)",
          borderTop: "1px solid var(--line)",
          paddingBottom: "env(safe-area-inset-bottom)",
          zIndex: 30,
        }}
        className="mobile-tabs"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "orders" ? "/app" : `/app?tab=${t.id}`}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              padding: "0.65rem 0.25rem",
              color: tab === t.id ? "var(--ink)" : "var(--label)",
              fontSize: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            {t.icon}
            {t.label.split(" ")[0]}
          </Link>
        ))}
      </nav>

    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--label)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 650, letterSpacing: "-0.02em" }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--leaf)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "0.9rem" }}>
      <div style={{ fontSize: 12, color: "var(--label)", marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function StatusChip({ status }: { status: string }) {
  const color = status === "Settled" || status === "Verified" ? "var(--ok)" : status === "Negotiating" || status === "Open" ? "var(--warn)" : "var(--label)";
  return (
    <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color, border: `1px solid ${color}`, padding: "0.35rem 0.65rem" }}>
      {status}
    </span>
  );
}

const h1: CSSProperties = { fontFamily: "var(--font-display), serif", fontSize: "clamp(1.6rem, 3vw, 2.1rem)", fontWeight: 500, letterSpacing: "-0.03em", margin: "0 0 0.35rem" };
const sub: CSSProperties = { color: "var(--label)", margin: "0 0 1.25rem", fontSize: 14 };
const panel: CSSProperties = { background: "rgba(255,255,255,0.55)", border: "1px solid var(--line)", padding: "1.35rem" };
const input: CSSProperties = { width: "100%", padding: "0.7rem 0.8rem", border: "1px solid var(--line)", background: "var(--foam)", color: "var(--ink)" };
const primaryBtn: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--foam)", border: "none", padding: "0.85rem 1.1rem", fontWeight: 650, cursor: "pointer" };
const secondaryBtn: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "var(--ink)", border: "1px solid var(--line)", padding: "0.55rem 0.85rem", fontWeight: 600, cursor: "pointer", fontSize: 13 };
