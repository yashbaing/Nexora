import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Layers,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import JoinWaitlist from "@/components/JoinWaitlist";
import AppShowcase from "@/components/AppShowcase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const stocks = [
  { symbol: "xAAPL", price: "$228.42", change: "+1.24%" },
  { symbol: "xTSLA", price: "$385.66", change: "-0.82%" },
  { symbol: "xNVDA", price: "$892.10", change: "+2.15%" },
  { symbol: "xMSFT", price: "$385.66", change: "+0.45%" },
  { symbol: "xGOOGL", price: "$355.89", change: "+0.91%" },
  { symbol: "xAMZN", price: "$185.00", change: "-0.33%" },
  { symbol: "xMETA", price: "$660.31", change: "+1.67%" },
  { symbol: "xRELI", price: "₹1,297", change: "+0.22%" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Real-time markets",
    description:
      "Live equity quotes streamed from Hyperliquid with candlestick charts, sector filters, and watchlists.",
  },
  {
    icon: Shield,
    title: "Non-custodial",
    description:
      "Connect Core Wallet or sign in with Google. Your keys, your assets — settlement stays on-chain.",
  },
  {
    icon: Layers,
    title: "Tokenized equities",
    description:
      "Each stock is an ERC-20 on Nexora — xAAPL, xTSLA, xNVDA and more, backed by oracle-signed quotes.",
  },
  {
    icon: Wallet,
    title: "USDC settlement",
    description:
      "Buy and sell with mock USDC on testnet or real USDC on mainnet. Instant on-chain confirmation.",
  },
  {
    icon: BarChart3,
    title: "Portfolio analytics",
    description:
      "Track holdings, allocation pie charts, P&L, and full on-chain transaction history in one dashboard.",
  },
  {
    icon: Zap,
    title: "Nexora-native",
    description:
      "Built for Nexora Fuji testnet and Nexora L1 — fast finality, low fees, and EVM compatibility.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    description: "Use Core Wallet, a dev account, or Google sign-in to create your Nexora profile.",
  },
  {
    step: "02",
    title: "Fund with USDC",
    description: "Mint test USDC from the built-in faucet or deposit USDC to your connected wallet.",
  },
  {
    step: "03",
    title: "Trade tokenized stocks",
    description: "Browse markets, place buy/sell orders, and settle trades on Nexora in seconds.",
  },
];

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-stone-950">
          Nexora.
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
          <a href="#features" className="transition hover:text-stone-950">Features</a>
          <a href="#how-it-works" className="transition hover:text-stone-950">How it works</a>
          <a href="#app" className="transition hover:text-stone-950">App</a>
          <a href="#markets" className="transition hover:text-stone-950">Markets</a>
        </nav>
        <div className="flex items-center gap-3">
          <JoinWaitlist variant="nav" />
          <Link
            href={APP_URL}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Ticker() {
  const items = [...stocks, ...stocks];
  return (
    <div className="border-y border-stone-200 bg-white overflow-hidden">
      <div className="animate-ticker flex gap-10 whitespace-nowrap py-3">
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-3 font-mono text-xs">
            <span className="font-semibold text-stone-700">{s.symbol}</span>
            <span className="text-stone-950">{s.price}</span>
            <span className={s.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
              {s.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="relative bg-stone-950 pt-16 text-white">
        <div className="dark-hero-glow dark-grid-pattern">
          <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center md:pt-32">
            <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-stone-500">
              [ Tokenized Equities ]
            </div>
            <h1 className="mt-8 font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
              Trade stocks.
              <br />
              <span className="text-orange-400">Settled on-chain.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-stone-400">
              Own xAAPL, xTSLA, xNVDA and more as on-chain tokens — live Hyperliquid
              pricing, USDC settlement in seconds, and keys that never leave your hands.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <JoinWaitlist variant="hero" />
              <Link
                href={APP_URL}
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-300 transition hover:text-white"
              >
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 text-xs text-stone-500">
              Free on testnet · Non-custodial · 12+ tokenized equities
            </p>
          </div>

          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/10 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">
            <span>01 Live markets</span>
            <span>02 One-tap trades</span>
            <span>03 USDC settlement</span>
            <span>04 Self-custody</span>
            <span>05 24/7 feeds</span>
          </div>
        </div>
        <Ticker />
      </section>

      {/* App showcase */}
      <AppShowcase />

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
              Everything you need to trade tokenized equities
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              From live market data to on-chain settlement — Nexora combines TradFi UX with
              DeFi infrastructure.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-stone-200 bg-stone-50 p-8 transition hover:border-stone-300 hover:bg-white hover:shadow-lg hover:shadow-stone-950/5"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-950 transition group-hover:bg-stone-950 group-hover:text-white group-hover:border-stone-950">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Three steps from wallet connection to on-chain trade settlement.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-stone-200 bg-white p-8">
                <div className="font-mono text-sm font-semibold text-stone-400">{s.step}</div>
                <h3 className="mt-4 text-xl font-semibold text-stone-950">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
                Available markets
              </h2>
              <p className="mt-4 max-w-xl text-lg text-stone-600">
                US and Indian equities tokenized as ERC-20s — trade with real-time Hyperliquid
                pricing.
              </p>
            </div>
            <Link
              href={APP_URL}
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-950 hover:underline"
            >
              View all markets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-stone-200">
            <div className="grid grid-cols-3 gap-4 border-b border-stone-200 bg-stone-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              <span>Symbol</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
            </div>
            {stocks.map((s, i) => (
              <div
                key={s.symbol}
                className={`grid grid-cols-3 gap-4 px-6 py-4 items-center ${
                  i < stocks.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <span className="font-mono text-sm font-semibold text-stone-950">{s.symbol}</span>
                <span className="font-mono text-sm text-right text-stone-700">{s.price}</span>
                <span
                  className={`font-mono text-sm text-right ${
                    s.change.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {s.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-serif text-4xl tracking-tight md:text-5xl">
                Built on proven infrastructure
              </h2>
              <p className="mt-4 text-lg text-stone-400 leading-relaxed">
                Nexora combines a high-performance L1, Hyperliquid&apos;s institutional
                liquidity feeds, and Solidity smart contracts with oracle-signed trade quotes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Network", value: "Nexora L1" },
                { label: "Settlement", value: "USDC (ERC-20)" },
                { label: "Price feed", value: "Hyperliquid WS" },
                { label: "Contracts", value: "Solidity 0.8.26" },
                { label: "Backend", value: "Express + PostgreSQL" },
                { label: "Frontend", value: "Next.js + ethers.js" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
                  <div className="text-xs uppercase tracking-widest text-stone-500">{item.label}</div>
                  <div className="mt-1 font-mono text-sm text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-1.5 text-xs font-medium text-stone-600 mb-6">
            <Globe className="h-3.5 w-3.5" />
            Open beta on Nexora Fuji testnet
          </div>
          <h2 className="font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
            Ready to trade on-chain?
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Connect your wallet, mint test USDC, and start trading tokenized equities in minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={APP_URL}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-950/10 transition hover:bg-stone-800"
            >
              Launch Nexora App
              <ArrowRight className="h-4 w-4" />
            </Link>
            <JoinWaitlist variant="cta" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-serif text-2xl text-stone-950">Nexora.</div>
              <p className="mt-2 text-sm text-stone-500">
                Tokenized equities platform on Nexora.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-stone-600">
              <a href="#features" className="hover:text-stone-950">Features</a>
              <a href="#how-it-works" className="hover:text-stone-950">How it works</a>
              <a href="#markets" className="hover:text-stone-950">Markets</a>
              <Link href={APP_URL} className="hover:text-stone-950">Trading App</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200 pt-8 text-xs text-stone-400">
            Nexora is a demonstration trading platform. Not financial advice. Trade at your own risk.
          </div>
        </div>
      </footer>
    </div>
  );
}
