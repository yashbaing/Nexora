import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Layers,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import JoinWaitlist from "@/components/JoinWaitlist";
import LiveShowcase from "@/components/LiveShowcase";
import ComingSoon from "@/components/ComingSoon";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const stocks = [
  { symbol: "xAAPL", name: "Apple", price: "$228.42", change: "+1.24%" },
  { symbol: "xTSLA", name: "Tesla", price: "$189.66", change: "-0.82%" },
  { symbol: "xNVDA", name: "NVIDIA", price: "$292.10", change: "+2.15%" },
  { symbol: "xMSFT", name: "Microsoft", price: "$185.08", change: "+0.45%" },
  { symbol: "xGOOGL", name: "Alphabet", price: "$154.12", change: "+0.91%" },
  { symbol: "xAMZN", name: "Amazon", price: "$185.00", change: "-0.33%" },
  { symbol: "xMETA", name: "Meta", price: "$247.86", change: "+1.67%" },
  { symbol: "xJPM", name: "JPMorgan", price: "$198.40", change: "+0.58%" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Institutional feeds",
    description:
      "Hyperliquid websocket prices stream into every screen — watchlists, charts, and order tickets stay in sync.",
  },
  {
    icon: Shield,
    title: "Keys stay yours",
    description:
      "Non-custodial wallet login. Nexora never holds your funds — trades settle to your address on-chain.",
  },
  {
    icon: Layers,
    title: "Real equity tokens",
    description:
      "xAAPL, xTSLA, xNVDA and more as ERC-20s with oracle-signed quotes — own exposure, not a synthetic IOU UI.",
  },
  {
    icon: Wallet,
    title: "USDC rails",
    description:
      "Fund once, trade freely. Settlement in USDC with confirmation in seconds on Nexora L1.",
  },
  {
    icon: BarChart3,
    title: "Portfolio clarity",
    description:
      "Holdings, allocation, P&L, and full transaction history — built for traders, not dashboards for dashboards.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description:
      "Low-fee finality on Nexora. Place a buy, watch the fill, see the token in your wallet.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect",
    description: "Link Core Wallet, a test account, or Google sign-in to open your Nexora profile.",
  },
  {
    step: "02",
    title: "Fund",
    description: "Mint test USDC from the faucet — or deposit USDC when mainnet opens.",
  },
  {
    step: "03",
    title: "Trade",
    description: "Pick a market, size the order, settle on-chain. Your tokens. Your keys.",
  },
];

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#07090d]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-white">
          Nexora.
        </Link>
        <nav className="flex items-center gap-7 text-sm text-white/60">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hidden transition hover:text-white sm:inline">
            How it works
          </a>
          <a href="#app" className="transition hover:text-white">
            Product
          </a>
          <a href="#markets" className="hidden transition hover:text-white sm:inline">
            Markets
          </a>
        </nav>
      </div>
    </header>
  );
}

function Ticker() {
  const items = [...stocks, ...stocks];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#07090d]">
      <div className="animate-ticker flex gap-10 whitespace-nowrap py-3.5">
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-3 font-mono text-xs">
            <span className="font-semibold text-white/70">{s.symbol}</span>
            <span className="text-white">{s.price}</span>
            <span className={s.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}>
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
    <div className="min-h-screen bg-[#f7f6f3]">
      <Nav />

      {/* Hero — one composition: brand, headline, line, CTAs, full-bleed trading visual */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#07090d] text-white">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/hero-trading-floor.png"
            alt=""
            fill
            priority
            className="animate-ken-burns object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090d]/40 via-[#07090d]/30 to-[#07090d]/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090d]/35 via-transparent to-[#07090d]/25" />
          <div className="hero-scan absolute inset-0 opacity-30" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 pb-24 pt-24 text-center">
          <p className="hero-rise font-serif text-5xl tracking-tight text-white md:text-7xl">
            Nexora.
          </p>
          <h1 className="hero-rise-delay mt-5 max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-white/95 md:text-5xl">
            Equities you can own.
            <br />
            <span className="italic text-[#f0a35e]">Settled in USDC.</span>
          </h1>
          <p className="hero-rise-delay-2 mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
            Trade tokenized stocks with live Hyperliquid pricing — self-custody wallets,
            on-chain fills, and a desk built for speed.
          </p>
          <div className="hero-rise-delay-2 mt-10 flex flex-wrap items-center justify-center gap-5">
            <JoinWaitlist variant="hero" />
            <ComingSoon variant="hero" />
          </div>
        </div>

        <Ticker />
      </section>

      <LiveShowcase />

      {/* Features — one job: why Nexora */}
      <section id="features" className="py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
              The desk
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
              A trading app that settles like a chain.
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Familiar market UX. Real on-chain ownership. No custodial shortcuts.
            </p>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#07090d] text-white">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold text-stone-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-stone-200/80 bg-white py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
              Flow
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
              Three steps to your first fill.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center md:text-left">
                <div className="font-mono text-sm font-semibold text-[#f0a35e]">{s.step}</div>
                <h3 className="mt-3 font-serif text-2xl text-stone-950">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
                Markets
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
                Twelve equities. One book.
              </h2>
              <p className="mt-4 max-w-xl text-lg text-stone-600">
                US names tokenized as ERC-20s — priced live, settled in USDC.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400">
              Full book in the app <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-12 overflow-hidden border border-stone-200 bg-white">
            <div className="grid grid-cols-12 gap-4 border-b border-stone-200 bg-[#f7f6f3] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              <span className="col-span-5">Symbol</span>
              <span className="col-span-3 hidden sm:block">Name</span>
              <span className="col-span-3 text-right sm:col-span-2">Last</span>
              <span className="col-span-4 text-right sm:col-span-2">24h</span>
            </div>
            {stocks.map((s, i) => (
              <div
                key={s.symbol}
                className={`grid grid-cols-12 items-center gap-4 px-5 py-4 ${
                  i < stocks.length - 1 ? "border-b border-stone-100" : ""
                }`}
              >
                <span className="col-span-5 font-mono text-sm font-semibold text-stone-950">
                  {s.symbol}
                </span>
                <span className="col-span-3 hidden text-sm text-stone-500 sm:block">{s.name}</span>
                <span className="col-span-3 text-right font-mono text-sm text-stone-700 sm:col-span-2">
                  {s.price}
                </span>
                <span
                  className={`col-span-4 text-right font-mono text-sm sm:col-span-2 ${
                    s.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {s.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infra strip */}
      <section className="bg-[#07090d] py-24 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                Stack
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
                Liquidity feeds. Oracle quotes. On-chain settlement.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/55">
                Nexora wires Hyperliquid market data into Solidity contracts — so every trade
                you see in the app is ready to settle on Nexora L1.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0">
              {[
                { label: "Network", value: "Nexora L1" },
                { label: "Settlement", value: "USDC" },
                { label: "Price feed", value: "Hyperliquid" },
                { label: "Custody", value: "Non-custodial" },
                { label: "Contracts", value: "Solidity 0.8" },
                { label: "Client", value: "Next.js" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-serif text-xl text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-4xl tracking-tight text-stone-950 md:text-5xl">
            Get early access to the desk.
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Join the waitlist for launch on Nexora Fuji testnet — free USDC faucet included.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <JoinWaitlist variant="cta" />
            <ComingSoon variant="cta" />
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-serif text-2xl text-stone-950">Nexora.</div>
              <p className="mt-2 text-sm text-stone-500">Tokenized equities. On-chain settlement.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-stone-600">
              <a href="#features" className="hover:text-stone-950">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-stone-950">
                How it works
              </a>
              <a href="#markets" className="hover:text-stone-950">
                Markets
              </a>
              <Link href={APP_URL} className="text-stone-400">
                App · Soon
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200 pt-8 text-xs text-stone-400">
            Demonstration platform. Not financial advice. Trade at your own risk.
          </div>
        </div>
      </footer>
    </div>
  );
}
