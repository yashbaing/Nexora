"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Wallet,
  Layers,
  Clock,
  ArrowRight,
  ChevronDown,
  Check,
  Sparkles,
  CircleDollarSign,
  LineChart,
  Lock,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════════════════ */
const T = {
  bg: "#060607",
  bg2: "#0b0b0d",
  ink: "#fafaf9",
  dim: "rgba(250, 250, 249, 0.62)",
  mute: "rgba(250, 250, 249, 0.4)",
  border: "rgba(255, 255, 255, 0.08)",
  red: "#e84142",
  amber: "#ffb45f",
  gain: "#34d399",
  loss: "#f87171",
};

const serif: React.CSSProperties = { fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.03em" };
const mono: React.CSSProperties = { fontFamily: "var(--font-geist-mono), monospace" };

/* ════════════════════════════════════════════════════════════════════
   MOCK MARKET DATA (deterministic — safe for SSR hydration)
   ════════════════════════════════════════════════════════════════════ */
const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", price: 254.61, change: +1.84, sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 187.32, change: +3.42, sector: "Semiconductors" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 431.08, change: -1.27, sector: "Automotive" },
  { symbol: "MSFT", name: "Microsoft", price: 512.44, change: +0.92, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com", price: 233.15, change: +2.11, sector: "E-Commerce" },
  { symbol: "GOOGL", name: "Alphabet", price: 201.77, change: +0.63, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms", price: 744.20, change: -0.48, sector: "Social Media" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 289.51, change: +1.05, sector: "Finance" },
];

/** Deterministic pseudo-random sparkline points (no Math.random → no hydration mismatch) */
function sparkline(seed: number, up: boolean): string {
  const pts: number[] = [];
  let v = 34;
  for (let i = 0; i < 24; i++) {
    const wave = Math.sin((i + seed * 3.7) * 0.9) * 6 + Math.sin((i + seed) * 0.35) * 8;
    const drift = (up ? -0.85 : 0.85) * i;
    pts.push(Math.min(58, Math.max(6, v + wave + drift * 0.55)));
  }
  return pts.map((y, i) => `${(i / 23) * 100},${y}`).join(" ");
}

/* ════════════════════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
   ════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WAITLIST FORM
   ════════════════════════════════════════════════════════════════════ */
function WaitlistForm({ id, compact = false }: { id: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const resp = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: id }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setStatus("success");
        setMessage(
          data.position
            ? `You're #${data.position.toLocaleString()} on the list. Watch your inbox.`
            : "You're on the list. Watch your inbox."
        );
      } else if (resp.status === 409) {
        setStatus("success");
        setMessage("You're already on the list — we've got you.");
      } else {
        throw new Error(data.error || "Request failed");
      }
    } catch {
      // Backend unreachable (e.g. static preview) — queue locally so signups aren't lost
      try {
        const key = "nexora_waitlist_pending";
        const pending = JSON.parse(localStorage.getItem(key) || "[]");
        if (!pending.includes(email)) pending.push(email);
        localStorage.setItem(key, JSON.stringify(pending));
        setStatus("success");
        setMessage("You're on the list. Watch your inbox.");
      } catch {
        setStatus("error");
        setMessage("Something went wrong — please try again.");
      }
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: compact ? "14px 18px" : "18px 22px",
          borderRadius: 16,
          background: "rgba(52, 211, 153, 0.08)",
          border: "1px solid rgba(52, 211, 153, 0.3)",
          maxWidth: 480,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(52, 211, 153, 0.18)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Check size={16} color={T.gain} />
        </span>
        <span style={{ fontSize: 14, color: T.ink, fontWeight: 500 }}>{message}</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      <div className="lp-waitlist-form" style={{ display: "flex", gap: 10 }}>
        <input
          className="lp-input"
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: compact ? "13px 16px" : "16px 20px",
            borderRadius: 14,
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          className="lp-cta-btn"
          disabled={status === "loading"}
          style={{
            padding: compact ? "13px 22px" : "16px 28px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: `linear-gradient(120deg, ${T.red}, #ff7a3d)`,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
            transition: "transform .2s ease, box-shadow .2s ease",
            boxShadow: "0 8px 24px rgba(232, 65, 66, 0.35)",
          }}
        >
          {status === "loading" ? "Joining..." : "Join the Waitlist"}
          {status !== "loading" && <ArrowRight size={15} />}
        </button>
      </div>
      {status === "error" && (
        <div style={{ marginTop: 10, fontSize: 12, color: T.loss }}>{message}</div>
      )}
      <div style={{ marginTop: 12, fontSize: 12, color: T.mute, display: "flex", alignItems: "center", gap: 6 }}>
        <Lock size={11} /> No spam. Early access invites roll out weekly.
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PHONE MOCKUP — miniature preview of the Nexora app
   ════════════════════════════════════════════════════════════════════ */
function PhoneMockup() {
  return (
    <div className="lp-float" style={{ position: "relative", width: 300 }}>
      {/* glow */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          background: `radial-gradient(circle at 50% 40%, rgba(232,65,66,0.28), transparent 65%)`,
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 40,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "linear-gradient(165deg, #131316, #09090b)",
          padding: 10,
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ borderRadius: 32, overflow: "hidden", background: "#0c0c0e", padding: "22px 18px 18px" }}>
          {/* status row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ ...serif, fontSize: 17, color: T.ink }}>Nexora.</div>
            <span
              className="lp-pulse"
              style={{
                fontSize: 9,
                ...mono,
                color: T.gain,
                border: "1px solid rgba(52,211,153,0.35)",
                padding: "3px 8px",
                borderRadius: 99,
                background: "rgba(52,211,153,0.08)",
              }}
            >
              ● LIVE
            </span>
          </div>
          {/* balance */}
          <div style={{ fontSize: 9, ...mono, color: T.mute, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Portfolio Value
          </div>
          <div style={{ ...serif, fontSize: 34, color: T.ink, margin: "6px 0 2px" }}>$48,392.14</div>
          <div style={{ fontSize: 12, color: T.gain, ...mono, marginBottom: 18 }}>▲ +12.4% all-time</div>
          {/* chart */}
          <svg viewBox="0 0 100 64" style={{ width: "100%", height: 90, display: "block" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="lp-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.gain} stopOpacity="0.35" />
                <stop offset="100%" stopColor={T.gain} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={sparkline(4, true)}
              fill="none"
              stroke={T.gain}
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polygon points={`0,64 ${sparkline(4, true)} 100,64`} fill="url(#lp-chart-fill)" />
          </svg>
          {/* holdings */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
            {STOCKS.slice(0, 3).map((s) => (
              <div
                key={s.symbol}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{s.symbol}</div>
                  <div style={{ fontSize: 9, color: T.mute }}>{s.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, ...mono, color: T.ink }}>${s.price.toFixed(2)}</div>
                  <div style={{ fontSize: 10, ...mono, color: s.change >= 0 ? T.gain : T.loss }}>
                    {s.change >= 0 ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* floating chips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        style={{
          position: "absolute",
          top: 78,
          right: -78,
          zIndex: 2,
          padding: "10px 14px",
          borderRadius: 14,
          background: "rgba(20,20,23,0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 9, color: T.mute, ...mono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Settled in</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 6 }}>
          <CircleDollarSign size={14} color="#2775ca" /> USDC
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.25, duration: 0.7 }}
        style={{
          position: "absolute",
          bottom: 96,
          left: -84,
          zIndex: 2,
          padding: "10px 14px",
          borderRadius: 14,
          background: "rgba(20,20,23,0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 9, color: T.mute, ...mono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Powered by</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={14} color={T.red} /> Avalanche
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FAQ ITEM
   ════════════════════════════════════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: `1px solid ${open ? "rgba(255,143,87,0.3)" : T.border}`,
        borderRadius: 16,
        background: open ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        transition: "all .25s ease",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: "20px 24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0, color: T.mute }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] }}
        style={{ overflow: "hidden" }}
      >
        <p style={{ padding: "0 24px 20px", margin: 0, fontSize: 14, lineHeight: 1.7, color: T.dim }}>{a}</p>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.count === "number") setWaitlistCount(d.count);
      })
      .catch(() => {});
  }, []);

  const tickerItems = useMemo(() => [...STOCKS, ...STOCKS], []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: <Layers size={20} />,
      title: "Real Stocks, Tokenized",
      body: "Every share is a fully-backed ERC-20 token on Avalanche. AAPL, NVDA, TSLA and more — own them on-chain, verifiable block by block.",
    },
    {
      icon: <Zap size={20} />,
      title: "Sub-2s Settlement",
      body: "No T+2. Trades settle on the Avalanche C-Chain in under two seconds, with finality you can point to on the explorer.",
    },
    {
      icon: <Clock size={20} />,
      title: "Markets That Never Sleep",
      body: "Trade 24/7/365. Weekends, holidays, 3am — tokenized markets don't ring a closing bell.",
    },
    {
      icon: <CircleDollarSign size={20} />,
      title: "Settled in USDC",
      body: "Deposit and settle in USDC. No banking rails, no wire delays, no currency games — just stable dollars on-chain.",
    },
    {
      icon: <LineChart size={20} />,
      title: "Institutional Price Feeds",
      body: "Live quotes streamed from Hyperliquid's institutional-grade oracle, signed and verified before every trade executes.",
    },
    {
      icon: <Shield size={20} />,
      title: "Non-Custodial by Design",
      body: "Your keys, your shares. Assets live in your wallet — not on our balance sheet. Connect MetaMask, Core, or sign in with Google.",
    },
  ];

  const steps = [
    {
      n: "01",
      icon: <Wallet size={22} />,
      title: "Connect your wallet",
      body: "MetaMask, Core Wallet, or one-tap Google sign-in. Non-custodial from the first click — no forms, no paperwork.",
    },
    {
      n: "02",
      icon: <CircleDollarSign size={22} />,
      title: "Fund with USDC",
      body: "Deposit USDC straight to your wallet. Your balance is on-chain, visible, and always withdrawable.",
    },
    {
      n: "03",
      icon: <TrendingUp size={22} />,
      title: "Trade tokenized stocks",
      body: "Buy AAPL at 2am on a Sunday. Every fill is signed by our price oracle and settled on Avalanche in seconds.",
    },
  ];

  const faqs = [
    {
      q: "What exactly is a tokenized stock?",
      a: "A tokenized stock is an ERC-20 token that mirrors the price of a real-world equity like Apple or NVIDIA. On Nexora, each token is minted and burned by audited smart contracts on Avalanche, priced by a live institutional oracle feed, and settled in USDC. You get stock-market exposure with crypto-market speed.",
    },
    {
      q: "When does Nexora launch?",
      a: "We're rolling out early access in waves. Our smart contracts (all 14 of them) are already live on the Avalanche Fuji testnet, and waitlist members get first access to the mainnet beta — earliest sign-ups get in first.",
    },
    {
      q: "Do I need to know anything about crypto?",
      a: "No. You can sign in with Google and Nexora handles the wallet plumbing for you. If you're a crypto native, connect MetaMask or Core Wallet and stay fully non-custodial. Either way, the experience feels like a modern brokerage app.",
    },
    {
      q: "Is Nexora custodial? Who holds my assets?",
      a: "You do. Nexora is non-custodial: your tokenized shares and USDC live in your own wallet. Trades execute through smart contracts with oracle-signed price quotes — we never take possession of your funds.",
    },
    {
      q: "What does it cost?",
      a: "Waitlist members trade commission-free during the beta. You only pay Avalanche network gas, which is typically a fraction of a cent per transaction.",
    },
    {
      q: "Which stocks can I trade?",
      a: "At launch: AAPL, NVDA, TSLA, MSFT, AMZN, GOOGL, META, JPM and more — with new listings added continuously based on community demand. Waitlist members vote on what lists next.",
    },
  ];

  return (
    <div ref={rootRef} className="lp-root">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 5vw, 56px)",
          height: 68,
          background: scrolled ? "rgba(6,6,7,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
          transition: "all .3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${T.red}, #ff7a3d)`,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 14px rgba(232,65,66,0.4)",
            }}
          >
            <TrendingUp size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ ...serif, fontSize: 21, color: T.ink }}>Nexora.</span>
        </div>

        <div className="lp-nav-links" style={{ display: "flex", alignItems: "center", gap: 30, fontSize: 13.5, fontWeight: 500 }}>
          {[
            ["Features", "features"],
            ["Markets", "markets"],
            ["How it works", "how"],
            ["FAQ", "faq"],
          ].map(([label, id]) => (
            <button
              key={id}
              type="button"
              className="lp-nav-link"
              onClick={() => scrollTo(id)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500 }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/app"
            className="lp-nav-link"
            style={{ fontSize: 13.5, fontWeight: 600, textDecoration: "none", padding: "9px 14px" }}
          >
            Launch App
          </Link>
          <button
            type="button"
            onClick={() => scrollTo("waitlist")}
            className="lp-cta-btn"
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: `linear-gradient(120deg, ${T.red}, #ff7a3d)`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
          >
            Join Waitlist
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <header id="waitlist" style={{ position: "relative", paddingTop: 150, overflow: "hidden" }}>
        {/* grid + glow background */}
        <div className="lp-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        <div
          style={{
            position: "absolute",
            top: -220,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 560,
            background: `radial-gradient(ellipse, rgba(232,65,66,0.22), rgba(255,143,87,0.08) 45%, transparent 70%)`,
            filter: "blur(48px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          className="lp-hero-grid"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 clamp(20px, 5vw, 56px) 90px",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 99,
                border: "1px solid rgba(255,143,87,0.3)",
                background: "rgba(232,65,66,0.08)",
                fontSize: 12,
                fontWeight: 600,
                color: T.amber,
                marginBottom: 26,
              }}
            >
              <Sparkles size={13} />
              14 smart contracts live on Avalanche — Early access opening soon
            </motion.div>

            <motion.h1
              className="lp-h1"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                ...serif,
                fontSize: "clamp(44px, 6.2vw, 76px)",
                lineHeight: 1.04,
                margin: "0 0 22px",
                fontWeight: 400,
                color: T.ink,
              }}
            >
              Wall Street,
              <br />
              <span className="lp-gradient-text">tokenized.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ fontSize: 17, lineHeight: 1.65, color: T.dim, maxWidth: 520, margin: "0 0 34px" }}
            >
              Nexora puts real stocks on-chain. Trade tokenized AAPL, NVDA and TSLA around the clock —
              settled in USDC on Avalanche in under two seconds, with your keys in your pocket.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <WaitlistForm id="hero" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30 }}
            >
              <div style={{ display: "flex" }}>
                {["#e84142", "#ff7a3d", "#ffb45f", "#34d399"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${c}, ${c}88)`,
                      border: "2px solid #060607",
                      marginLeft: i === 0 ? 0 : -9,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {["Y", "A", "R", "+"][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: T.dim }}>
                <strong style={{ color: T.ink }}>
                  {waitlistCount !== null ? waitlistCount.toLocaleString() : "2,400"}+
                </strong>{" "}
                traders already in line
              </span>
            </motion.div>
          </div>

          <motion.div
            className="lp-hero-phone"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <PhoneMockup />
          </motion.div>
        </div>

        {/* ── TICKER TAPE ────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
            background: "rgba(255,255,255,0.015)",
            overflow: "hidden",
          }}
        >
          <div className="lp-marquee" style={{ display: "flex", gap: 44, padding: "14px 0", width: "max-content" }}>
            {tickerItems.map((s, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, ...mono, fontSize: 12.5 }}>
                <span style={{ color: T.mute, fontWeight: 600 }}>{s.symbol}</span>
                <span style={{ color: T.ink }}>${s.price.toFixed(2)}</span>
                <span style={{ color: s.change >= 0 ? T.gain : T.loss }}>
                  {s.change >= 0 ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px clamp(20px, 5vw, 56px) 40px" }}>
        <Reveal>
          <div
            className="lp-stats-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          >
            {[
              ["<2s", "on-chain settlement"],
              ["24/7", "markets, never closed"],
              ["$0", "commissions in beta"],
              ["14", "live smart contracts"],
            ].map(([big, small]) => (
              <div key={small} style={{ textAlign: "center", padding: "28px 12px", borderRadius: 20, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ ...serif, fontSize: 40, color: T.ink, lineHeight: 1 }}>{big}</div>
                <div style={{ fontSize: 12.5, color: T.mute, marginTop: 10 }}>{small}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "70px clamp(20px, 5vw, 56px)" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, ...mono, color: T.amber, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
              Why Nexora
            </div>
            <h2 className="lp-h2" style={{ ...serif, fontSize: "clamp(30px, 4vw, 46px)", margin: "0 0 16px", fontWeight: 400, color: T.ink }}>
              The brokerage, rebuilt on-chain
            </h2>
            <p style={{ fontSize: 16, color: T.dim, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
              Everything you expect from a modern trading app — with the transparency, speed and self-custody only a blockchain can deliver.
            </p>
          </div>
        </Reveal>

        <div className="lp-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="lp-card" style={{ padding: 28, height: "100%" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: "linear-gradient(135deg, rgba(232,65,66,0.18), rgba(255,143,87,0.1))",
                    border: "1px solid rgba(255,143,87,0.25)",
                    display: "grid",
                    placeItems: "center",
                    color: T.amber,
                    marginBottom: 18,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: T.dim, margin: 0 }}>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MARKETS SHOWCASE ─────────────────────────────── */}
      <section id="markets" style={{ position: "relative", padding: "70px 0", background: T.bg2, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }}>
          <Reveal>
            <div className="lp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "end", marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 12, ...mono, color: T.amber, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
                  Launch Markets
                </div>
                <h2 className="lp-h2" style={{ ...serif, fontSize: "clamp(30px, 4vw, 46px)", margin: 0, fontWeight: 400, color: T.ink }}>
                  Blue chips, on the chain
                </h2>
              </div>
              <p style={{ fontSize: 15, color: T.dim, lineHeight: 1.65, margin: 0 }}>
                Eight flagship equities at launch, streamed live from Hyperliquid's oracle. New listings added continuously — waitlist members vote on what lists next.
              </p>
            </div>
          </Reveal>

          <div className="lp-stocks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STOCKS.map((s, i) => {
              const up = s.change >= 0;
              return (
                <Reveal key={s.symbol} delay={i * 0.06}>
                  <div className="lp-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{s.symbol}</div>
                        <div style={{ fontSize: 10.5, color: T.mute, marginTop: 2 }}>{s.name}</div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          ...mono,
                          fontWeight: 700,
                          color: up ? T.gain : T.loss,
                          background: up ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                          padding: "3px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {up ? "+" : ""}
                        {s.change.toFixed(2)}%
                      </span>
                    </div>
                    <svg viewBox="0 0 100 64" style={{ width: "100%", height: 44, display: "block", margin: "10px 0" }} preserveAspectRatio="none">
                      <polyline
                        points={sparkline(i + 1, up)}
                        fill="none"
                        stroke={up ? T.gain : T.loss}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ ...mono, fontSize: 15, color: T.ink, fontWeight: 600 }}>${s.price.toFixed(2)}</span>
                      <span style={{ fontSize: 10, color: T.mute }}>{s.sector}</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" style={{ maxWidth: 1200, margin: "0 auto", padding: "90px clamp(20px, 5vw, 56px)" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, ...mono, color: T.amber, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
              How it works
            </div>
            <h2 className="lp-h2" style={{ ...serif, fontSize: "clamp(30px, 4vw, 46px)", margin: 0, fontWeight: 400, color: T.ink }}>
              From zero to your first trade
              <br />
              in three minutes
            </h2>
          </div>
        </Reveal>

        <div className="lp-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div style={{ position: "relative", padding: "32px 28px", borderRadius: 20, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)", height: "100%" }}>
                <div style={{ ...serif, fontSize: 60, color: "rgba(255,255,255,0.06)", position: "absolute", top: 14, right: 22, lineHeight: 1 }}>
                  {s.n}
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${T.red}, #ff7a3d)`,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    marginBottom: 20,
                    boxShadow: "0 8px 22px rgba(232,65,66,0.35)",
                  }}
                >
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.dim, margin: 0 }}>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TRUST / TECH ─────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "20px clamp(20px, 5vw, 56px) 90px" }}>
        <Reveal>
          <div
            style={{
              borderRadius: 28,
              border: `1px solid ${T.border}`,
              background: `linear-gradient(140deg, rgba(232,65,66,0.1), rgba(255,143,87,0.04) 45%, rgba(255,255,255,0.02))`,
              padding: "clamp(32px, 5vw, 60px)",
            }}
          >
            <div className="lp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, ...mono, color: T.amber, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
                  Built different
                </div>
                <h2 className="lp-h2" style={{ ...serif, fontSize: "clamp(28px, 3.4vw, 40px)", margin: "0 0 18px", fontWeight: 400, color: T.ink }}>
                  Verifiable, not vibes
                </h2>
                <p style={{ fontSize: 15, color: T.dim, lineHeight: 1.7, margin: 0 }}>
                  Every Nexora trade is an on-chain transaction you can audit yourself. Price quotes are
                  cryptographically signed by our oracle before execution, positions are ERC-20 balances
                  in your own wallet, and the entire platform — all 14 contracts — is already deployed
                  and running on Avalanche.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  [<Zap key="z" size={17} />, "Avalanche C-Chain", "Sub-second finality, near-zero gas fees"],
                  [<CircleDollarSign key="c" size={17} />, "USDC settlement", "Stable, transparent, instantly withdrawable"],
                  [<Globe key="g" size={17} />, "Hyperliquid oracle", "Institutional-grade live price feeds"],
                  [<Shield key="s" size={17} />, "Non-custodial", "Your keys, your shares — always"],
                ].map(([icon, title, sub]) => (
                  <div
                    key={title as string}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "rgba(6,6,7,0.5)",
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ color: T.amber, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</div>
                      <div style={{ fontSize: 12, color: T.mute, marginTop: 2 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" style={{ maxWidth: 780, margin: "0 auto", padding: "20px clamp(20px, 5vw, 56px) 100px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 12, ...mono, color: T.amber, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
              FAQ
            </div>
            <h2 className="lp-h2" style={{ ...serif, fontSize: "clamp(30px, 4vw, 46px)", margin: 0, fontWeight: 400, color: T.ink }}>
              Questions, answered
            </h2>
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05} y={16}>
              <FaqItem q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", borderTop: `1px solid ${T.border}` }}>
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: "50%",
            transform: "translateX(-50%)",
            width: 1000,
            height: 500,
            background: `radial-gradient(ellipse, rgba(232,65,66,0.25), rgba(255,143,87,0.08) 45%, transparent 70%)`,
            filter: "blur(52px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "110px clamp(20px, 5vw, 56px)", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ ...serif, fontSize: "clamp(36px, 5vw, 60px)", margin: "0 0 20px", fontWeight: 400, color: T.ink, lineHeight: 1.08 }}>
              The market never closes.
              <br />
              <span className="lp-gradient-text">Neither should you.</span>
            </h2>
            <p style={{ fontSize: 16, color: T.dim, lineHeight: 1.65, margin: "0 auto 38px", maxWidth: 480 }}>
              Join the waitlist today and lock in early access, zero-commission beta trading, and a vote on which stocks we tokenize next.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <WaitlistForm id="footer" compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.bg2 }}>
        <div
          className="lp-footer-grid"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "56px clamp(20px, 5vw, 56px) 40px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${T.red}, #ff7a3d)`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <TrendingUp size={14} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ ...serif, fontSize: 19, color: T.ink }}>Nexora.</span>
            </div>
            <p style={{ fontSize: 13, color: T.mute, lineHeight: 1.65, maxWidth: 300, margin: 0 }}>
              The Web3-native brokerage. Tokenized equities on Avalanche, settled in USDC, streaming
              live from institutional price feeds.
            </p>
          </div>

          {(
            [
              ["Product", [["Features", "#features"], ["Markets", "#markets"], ["How it works", "#how"], ["Launch App", "/app"]]],
              ["Company", [["FAQ", "#faq"], ["Waitlist", "#waitlist"], ["GitHub", "https://github.com/yashbaing/Nexora"]]],
              ["Network", [["Avalanche", "https://www.avax.network"], ["USDC", "https://www.circle.com/usdc"], ["Hyperliquid", "https://hyperliquid.xyz"]]],
            ] as [string, [string, string][]][]
          ).map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 12, ...mono, color: T.mute, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(([label, href]) =>
                  href.startsWith("#") ? (
                    <button
                      key={label}
                      type="button"
                      className="lp-nav-link"
                      onClick={() => scrollTo(href.slice(1))}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, textAlign: "left", padding: 0 }}
                    >
                      {label}
                    </button>
                  ) : href.startsWith("/") ? (
                    <Link key={label} href={href} className="lp-nav-link" style={{ fontSize: 13.5, textDecoration: "none" }}>
                      {label}
                    </Link>
                  ) : (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="lp-nav-link" style={{ fontSize: 13.5, textDecoration: "none" }}>
                      {label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            padding: "20px clamp(20px, 5vw, 56px)",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <span style={{ fontSize: 12, color: T.mute }}>© 2026 Nexora Labs. All rights reserved.</span>
          <span style={{ fontSize: 11.5, color: T.mute, maxWidth: 560, lineHeight: 1.5 }}>
            Tokenized assets involve risk. Nexora is currently in testnet beta — nothing here is financial advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
