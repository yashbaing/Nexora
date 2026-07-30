"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stocks", label: "Markets" },
  { href: "#waitlist", label: "Waitlist" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "landing-glass border-b border-white/5" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-[#06060b]" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Token<span className="landing-gradient-text">ssized</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/app" className="landing-btn-ghost text-sm py-2 px-4">
            Open App
          </Link>
          <a href="#waitlist" className="landing-btn-primary text-sm py-2 px-5">
            Join Waitlist
          </a>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden landing-glass border-t border-white/5 px-4 py-4 flex flex-col gap-3"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-300 py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/app" className="landing-btn-ghost text-center mt-2">
            Open App
          </Link>
          <a href="#waitlist" className="landing-btn-primary text-center">
            Join Waitlist
          </a>
        </motion.div>
      )}
    </header>
  );
}
