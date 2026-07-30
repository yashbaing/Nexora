import { MessageCircle, Send, X } from "lucide-react";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Why Nexora", href: "#why" },
      { label: "Assets", href: "#assets" },
      { label: "How it works", href: "#how" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Testnet contracts",
        href: "https://testnet.snowtrace.io/address/0xf4d581d6974EDF49a8695D1a1aA3834FaB35D0ec",
      },
      { label: "Avalanche C-Chain", href: "https://www.avax.network/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#04050a]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Trade tokenized global equities on-chain — instant settlement,
              fractional shares, and full self-custody. Built on Avalanche.
            </p>
            <div className="mt-6 flex gap-3">
              {[X, MessageCircle, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="text-sm text-white/45 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.07] pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            Nexora is currently live on the Avalanche Fuji testnet. Tokenized
            equities are synthetic on-chain instruments and do not confer
            shareholder rights in the underlying company. Nothing here is
            financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
