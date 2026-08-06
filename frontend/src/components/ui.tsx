"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/app", label: "Orders" },
  { href: "/app/mandate", label: "Mandate" },
  { href: "/app/agent", label: "Agent" },
  { href: "/app/settlement", label: "Settlement" },
  { href: "/app/receipt", label: "Receipt" },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const inApp = pathname?.startsWith("/app");

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="display text-2xl tracking-tight text-[var(--ink)]">ArcMOQ</span>
        {!compact && (
          <span className="hidden text-xs uppercase tracking-[0.2em] text-[var(--brass)] sm:inline">
            Group inventory
          </span>
        )}
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2">
        {inApp ? (
          links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-2.5 py-1.5 text-xs sm:text-sm ${
                  active ? "text-[var(--brass-soft)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-0.5 h-px bg-[var(--brass)]"
                  />
                )}
              </Link>
            );
          })
        ) : (
          <>
            <Link href="/#how" className="hidden px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] md:inline">
              How it works
            </Link>
            <Link href="/#tracks" className="hidden px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] md:inline">
              Tracks
            </Link>
            <Link href="/app" className="btn btn-primary ml-2">
              Launch demo
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function LabelBadge({ children }: { children: React.ReactNode }) {
  return <span className="label-pill">{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</div>
      <div className="display mt-1 text-2xl text-[var(--ink)]">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
