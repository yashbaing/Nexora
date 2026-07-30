import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { site, socialLinks } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Markets", href: "/markets" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Technology", href: "/#technology" },
      { label: "Roadmap", href: "/#roadmap" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "What is a tokenized stock?", href: "/how-it-works#tokenized" },
      { label: "Self-custody, explained", href: "/how-it-works#custody" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Risk disclosure", href: "/legal/terms#risk" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-abyss">
      <div className="orb -top-40 left-1/2 h-80 w-[52rem] -translate-x-1/2 bg-mint/8" />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ash">
              {site.shortDescription}
            </p>
            <Link href="/#waitlist" className="btn btn-primary mt-7">
              Join the waitlist
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-ash transition-colors hover:text-chalk"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-white/8 bg-white/2 p-5">
          <p className="text-[12.5px] leading-relaxed text-smoke">
            <span className="font-semibold text-ash">Important.</span> {site.name} is
            pre-launch software running on a test network. Equity tokens are price-tracking
            instruments, not shares: holding one confers no ownership of the underlying
            company, no voting rights and no entitlement to dividends. Prices shown across
            this site are indicative and sourced from a market-linked feed for demonstration.
            Nothing here is investment advice, an offer to sell, or a solicitation to buy any
            security. Digital assets carry substantial risk, including total loss of value.
            Availability may be restricted in your jurisdiction.
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-5 border-t border-white/8 pt-7 sm:flex-row sm:items-center">
          <p className="text-[13px] text-smoke">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-[12.5px] text-ash transition-colors hover:border-white/25 hover:text-chalk"
                >
                  {s.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-smoke">
              Social channels open at launch —{" "}
              <Link href="/#waitlist" className="text-ash underline-offset-4 hover:text-chalk hover:underline">
                join the waitlist
              </Link>{" "}
              for updates.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
