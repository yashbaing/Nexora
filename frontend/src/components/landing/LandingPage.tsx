"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";
import HeroVisual from "./HeroVisual";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(typeof d.count === "number" ? d.count : 0))
      .catch(() => setCount(null));

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="nx-site">
      <header className={`nx-nav ${scrolled ? "nx-nav--solid" : ""}`}>
        <a href="#top" className="nx-logo" aria-label="Nexora home">
          Nexora
        </a>
        <nav className="nx-nav__links">
          <a href="#product">Product</a>
          <a href="#markets">Markets</a>
          <a href="#access">Access</a>
        </nav>
        <div className="nx-nav__actions">
          <Link href="/app" className="nx-link-quiet">
            Open app
          </Link>
          <button type="button" className="nx-btn nx-btn--sm" onClick={scrollToWaitlist}>
            Join waitlist
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO — brand, one headline, one line, CTA, full-bleed visual */}
        <section className="nx-hero">
          <motion.div
            className="nx-hero__visual"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroVisual />
          </motion.div>

          <div className="nx-hero__copy">
            <motion.p
              className="nx-brand-mark"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              Nexora
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}>
              Own real stocks.
              <br />
              Trade them as tokens.
            </motion.h1>
            <motion.p className="nx-hero__sub" variants={fadeUp} initial="hidden" animate="show" custom={2}>
              Avalanche-native equities, settled in USDC with Hyperliquid liquidity.
            </motion.p>
            <motion.div
              id="waitlist"
              className="nx-hero__cta"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <WaitlistForm variant="hero" source="hero" />
              <p className="nx-hero__meta">
                {count !== null && count > 0 ? (
                  <>
                    <span>{count.toLocaleString()}</span> traders already waiting · No spam, ever
                  </>
                ) : (
                  <>Early access opens soon · No spam, ever</>
                )}
              </p>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT */}
        <section id="product" className="nx-section nx-section--product">
          <motion.div
            className="nx-section__head"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
          >
            <h2>One wallet. Global equities. On-chain.</h2>
            <p>Nexora turns blue-chip stocks into tradeable tokens — priced live, settled instantly.</p>
          </motion.div>

          <div className="nx-features">
            {[
              {
                title: "Fractional by design",
                body: "Buy $10 of AAPL or $10,000 of NVDA. Same rail, same settlement.",
              },
              {
                title: "USDC settlement",
                body: "No fiat rails. No weekend blackouts. Positions clear in stablecoin.",
              },
              {
                title: "Hyperliquid depth",
                body: "Institutional liquidity under the hood so your fills stay sharp.",
              },
            ].map((f, i) => (
              <motion.article
                key={f.title}
                className="nx-feature"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
              >
                <span className="nx-feature__index">0{i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* MARKETS */}
        <section id="markets" className="nx-section nx-section--markets">
          <motion.div
            className="nx-section__head"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
          >
            <h2>Markets that never sleep.</h2>
            <p>Tokenized AAPL, TSLA, NVDA, MSFT, META, AMZN — more names joining every wave.</p>
          </motion.div>

          <div className="nx-markets-strip" aria-hidden="true">
            <div className="nx-markets-strip__track">
              {[
                ["AAPL", "+1.42%"],
                ["TSLA", "+3.18%"],
                ["NVDA", "-0.64%"],
                ["MSFT", "+0.91%"],
                ["META", "+2.05%"],
                ["AMZN", "+1.12%"],
                ["GOOGL", "+0.77%"],
                ["AAPL", "+1.42%"],
                ["TSLA", "+3.18%"],
                ["NVDA", "-0.64%"],
                ["MSFT", "+0.91%"],
                ["META", "+2.05%"],
                ["AMZN", "+1.12%"],
                ["GOOGL", "+0.77%"],
              ].map(([sym, ch], i) => (
                <div key={`${sym}-${i}`} className="nx-market-chip">
                  <strong>{sym}</strong>
                  <span className={ch.startsWith("-") ? "down" : "up"}>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACCESS / FINAL CTA */}
        <section id="access" className="nx-section nx-section--access">
          <motion.div
            className="nx-access"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="nx-brand-mark nx-brand-mark--sm">Nexora</p>
            <h2>Be first when the gates open.</h2>
            <p>Waitlist members get early access, founder perks, and priority deposit limits.</p>
            <WaitlistForm variant="footer" source="access" />
          </motion.div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-footer__brand">Nexora</div>
        <p>Tokenized equities on Avalanche · Built for the next market.</p>
        <div className="nx-footer__links">
          <Link href="/app">Launch app</Link>
          <a href="mailto:hello@nexora.app">Contact</a>
        </div>
      </footer>
    </div>
  );
}
