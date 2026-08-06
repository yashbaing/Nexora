"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Globe2, ShieldCheck, Sparkles } from "lucide-react";

const labels = [
  { k: "AED Collection", v: "Simulated PSP" },
  { k: "Arc Settlement", v: "Live / Local Testnet" },
  { k: "Supplier Quotes", v: "Sandbox" },
  { k: "StableFX", v: "Adapter Mode" },
  { k: "Warehouse", v: "Demo Verifier" },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="olive-haze" style={{ minHeight: "100dvh", overflowX: "hidden" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ fontFamily: "var(--font-display), serif", fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.03em" }}>
          ArcMOQ
        </div>
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="#how" style={{ fontSize: 14, color: "var(--label)" }}>How it works</a>
          <Link
            href="/app"
            style={{
              background: "var(--ink)",
              color: "var(--foam)",
              padding: "0.65rem 1rem",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Open demo
          </Link>
        </nav>
      </header>

      {/* HERO — brand first, one composition, full-bleed atmosphere */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100dvh - 72px)",
          display: "grid",
          alignItems: "end",
          padding: "2rem 1.5rem 3.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "8% 0 auto auto",
            width: "min(52vw, 560px)",
            height: "min(70vh, 620px)",
            background:
              "linear-gradient(145deg, rgba(11,31,23,0.92) 0%, rgba(22,53,40,0.75) 40%, rgba(107,143,113,0.45) 100%)",
            clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 82%)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
        <div
          aria-hidden
          className="arc-grid"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          <div className="rise" style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(3.4rem, 9vw, 6.4rem)", lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 550, marginBottom: "1.25rem" }}>
            ArcMOQ
          </div>
          <h1 className="rise rise-delay-1" style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(1.45rem, 3.2vw, 2.1rem)", fontWeight: 450, lineHeight: 1.25, maxWidth: 560, margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
            Small buyers. Real inventory. One autonomous global order.
          </h1>
          <p className="rise rise-delay-2" style={{ fontSize: "1.05rem", lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: 520, margin: "0 0 1.75rem" }}>
            UAE SMEs pool demand for Spanish olive oil. An AI agent negotiates MOQ and settles the supplier in EURC on Arc — each buyer gets an onchain warehouse receipt for their share.
          </p>
          <div className="rise rise-delay-3" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <Link
              href="/app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--citrus)",
                color: "var(--ink)",
                padding: "0.9rem 1.25rem",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Run the olive-oil demo <ArrowRight size={18} />
            </Link>
            <a href="#tracks" style={{ fontSize: 14, color: "var(--label)", borderBottom: "1px solid var(--line)", paddingBottom: 2 }}>
              SME Trade · RWA · Agentic · Cross-border
            </a>
          </div>
        </div>
      </section>

      <section id="how" style={{ background: "var(--ink)", color: "var(--foam)", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: 12, color: "var(--leaf-bright)", marginBottom: 12 }}>How ArcMOQ works</p>
          <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 500, letterSpacing: "-0.03em", maxWidth: 640, margin: "0 0 2.5rem" }}>
            Group purchasing, agentic negotiation, stablecoin settlement, tokenized claims.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: <Boxes size={22} />, t: "Pool demand", d: "Compatible UAE mandates combine until wholesale MOQ is within reach." },
              { icon: <Sparkles size={22} />, t: "AI negotiates", d: "Structured counteroffers — not free chat — renegotiate MOQ for immediate EURC." },
              { icon: <Globe2 size={22} />, t: "Settle on Arc", d: "USDC pooled on Arc converts via StableFX adapter; supplier receives EURC." },
              { icon: <ShieldCheck size={22} />, t: "Mint receipts", d: "After warehouse attestation, each buyer holds redeemable ERC-1155 claims." },
            ].map((x) => (
              <div key={x.t} style={{ borderTop: "1px solid rgba(247,243,235,0.18)", paddingTop: "1.25rem" }}>
                <div style={{ color: "var(--citrus)", marginBottom: 10 }}>{x.icon}</div>
                <h3 style={{ fontSize: 18, margin: "0 0 0.5rem", fontWeight: 600 }}>{x.t}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(247,243,235,0.72)" }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tracks" style={{ padding: "4rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "2rem", fontWeight: 500, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
          Demo use case
        </h2>
        <p style={{ color: "var(--label)", maxWidth: 560, marginBottom: "2rem", lineHeight: 1.5 }}>
          Extra virgin olive oil from Jaén, Spain — 5-liter tins for UAE restaurants, hotels, grocery, and catering. Original MOQ 1,000 · combined demand 860 · agent renegotiates to 860.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "2.5rem" }}>
          {labels.map((l) => (
            <span key={l.k} className="label-pill">
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{l.k}:</strong> {l.v}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            ["Primary", "SME Trade Finance", "Pool capital, wholesale terms, refunds if the order fails."],
            ["Secondary", "RWA Tokenization", "Receipts = commercial claims on a verified shipment — not yield tokens."],
            ["Secondary", "Agentic Economy", "Research, negotiate, policy-check, execute within buyer mandates."],
            ["Secondary", "Cross-Border Payments", "AED UX → USDC on Arc → EURC to Spanish supplier."],
          ].map(([tier, title, body]) => (
            <div key={title} style={{ padding: "1.25rem 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--leaf)", marginBottom: 6 }}>{tier}</div>
              <div style={{ fontWeight: 650, marginBottom: 6 }}>{title}</div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--label)", lineHeight: 1.45 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "2rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto", fontSize: 13, color: "var(--label)" }}>
        <span style={{ fontFamily: "var(--font-display), serif", color: "var(--ink)", fontSize: 16 }}>ArcMOQ</span>
        <span>Built for Circle Arc · Hackathon MVP</span>
      </footer>
    </main>
  );
}
