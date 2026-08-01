import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Layers,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import JoinWaitlist from "@/components/JoinWaitlist";
import LiveShowcase from "@/components/LiveShowcase";
import ComingSoon from "@/components/ComingSoon";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const X_URL = "https://x.com/Nexoraa7";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.259 5.686L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

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
    title: "Live prices",
    description:
      "Stock prices update in real time across markets, charts, and your portfolio.",
  },
  {
    icon: Activity,
    title: "Hyperliquid feeds",
    description:
      "Market data streams from Hyperliquid so quotes and charts stay in sync with live prices.",
  },
  {
    icon: Shield,
    title: "Non-custodial",
    description:
      "Connect your own wallet. Nexora does not hold your funds — trades settle to your address.",
  },
  {
    icon: Layers,
    title: "Tokenized stocks",
    description:
      "Trade xAAPL, xTSLA, xNVDA and more as on chain tokens backed by oracle-signed quotes.",
  },
  {
    icon: Wallet,
    title: "USDC settlement",
    description:
      "Buy and sell using USDC. Trades confirm on Nexora L1 in seconds.",
  },
  {
    icon: BarChart3,
    title: "Portfolio tracking",
    description:
      "See your holdings, gains and losses, and full trade history in one place.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    description: "Sign in with Core Wallet, a test account, or Google.",
  },
  {
    step: "02",
    title: "Add USDC",
    description: "Mint free test USDC from the faucet, or deposit USDC later on mainnet.",
  },
  {
    step: "03",
    title: "Start trading",
    description: "Choose a stock, place a buy or sell, and settle on chain.",
  },
];

function Nav() {
  return (
    <header className="safe-pad-top fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#07090d]/70 backdrop-blur-xl">
      <div className="safe-pad-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="font-serif text-xl tracking-tight text-white sm:text-2xl">
          Nexora.
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/60 sm:gap-7">
          <a href="#features" className="py-2 transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hidden py-2 transition hover:text-white sm:inline">
            How it works
          </a>
          <a href="#app" className="py-2 transition hover:text-white">
            App
          </a>
          <a href="#markets" className="hidden py-2 transition hover:text-white sm:inline">
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
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#07090d] text-white">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/hero-trading-floor.png"
            alt=""
            fill
            priority
            className="animate-ken-burns object-cover object-[center_30%] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090d]/40 via-[#07090d]/30 to-[#07090d]/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090d]/35 via-transparent to-[#07090d]/25" />
          <div className="hero-scan absolute inset-0 opacity-30" />
        </div>

        <div className="safe-pad-x relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-8 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-24">
          <p className="hero-rise font-serif text-4xl tracking-tight text-white sm:text-5xl md:text-7xl">
            Nexora.
          </p>
          <h1 className="hero-rise-delay mt-3 max-w-3xl font-serif text-[1.65rem] leading-[1.15] tracking-tight text-white/95 sm:mt-5 sm:text-3xl md:text-5xl">
            Trade stocks.
            <br />
            <span className="text-[#f0a35e]">Settled on chain.</span>
          </h1>
          <p className="hero-rise-delay-2 mx-auto mt-4 max-w-lg text-[0.95rem] leading-relaxed text-white/65 sm:mt-6 sm:text-base md:text-lg">
            Buy and sell tokenized stocks like xAAPL, xTSLA, and xNVDA with live prices,
            USDC settlement, and a wallet you control.
          </p>
          <div className="hero-rise-delay-2 mt-7 flex w-full max-w-sm flex-col items-center gap-4 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
            <JoinWaitlist variant="hero" />
            <ComingSoon variant="hero" />
          </div>
        </div>

        <Ticker />
      </section>

      <LiveShowcase />

      {/* Features — one job: why Nexora */}
      <section id="features" className="py-16 sm:py-24 md:py-28">
        <div className="safe-pad-x mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
              Features
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950 sm:mt-4 sm:text-4xl md:text-5xl">
              Everything you need to trade
            </h2>
            <p className="mt-3 text-base text-stone-600 sm:mt-4 sm:text-lg">
              Live markets, simple portfolio tools, and on chain settlement in one app.
            </p>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:mt-16 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#07090d] text-white sm:mb-4">
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
      <section id="how-it-works" className="border-y border-stone-200/80 bg-white py-16 sm:py-24 md:py-28">
        <div className="safe-pad-x mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950 sm:mt-4 sm:text-4xl md:text-5xl">
              Get started in three steps
            </h2>
          </div>

          <div className="mt-10 grid gap-10 sm:mt-16 sm:gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center md:text-left">
                <div className="font-mono text-sm font-semibold text-[#f0a35e]">{s.step}</div>
                <h3 className="mt-3 font-serif text-xl text-stone-950 sm:text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:mt-3">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="py-16 sm:py-24 md:py-28">
        <div className="safe-pad-x mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-400">
                Markets
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950 sm:mt-4 sm:text-4xl md:text-5xl">
                Available markets
              </h2>
              <p className="mt-3 max-w-xl text-base text-stone-600 sm:mt-4 sm:text-lg">
                Popular stocks as on chain tokens, priced in real time and settled in USDC.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400">
              See all in the app <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-8 overflow-x-auto border border-stone-200 bg-white sm:mt-12">
            <div className="min-w-[300px]">
              <div className="grid grid-cols-12 gap-2 border-b border-stone-200 bg-[#f7f6f3] px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-stone-400 sm:gap-4 sm:px-5">
                <span className="col-span-5">Symbol</span>
                <span className="col-span-3 hidden sm:block">Name</span>
                <span className="col-span-3 text-right sm:col-span-2">Last</span>
                <span className="col-span-4 text-right sm:col-span-2">24h</span>
              </div>
              {stocks.map((s, i) => (
                <div
                  key={s.symbol}
                  className={`grid grid-cols-12 items-center gap-2 px-3 py-3.5 sm:gap-4 sm:px-5 sm:py-4 ${
                    i < stocks.length - 1 ? "border-b border-stone-100" : ""
                  }`}
                >
                  <span className="col-span-5 font-mono text-[13px] font-semibold text-stone-950 sm:text-sm">
                    {s.symbol}
                  </span>
                  <span className="col-span-3 hidden text-sm text-stone-500 sm:block">{s.name}</span>
                  <span className="col-span-3 text-right font-mono text-[13px] text-stone-700 sm:col-span-2 sm:text-sm">
                    {s.price}
                  </span>
                  <span
                    className={`col-span-4 text-right font-mono text-[13px] sm:col-span-2 sm:text-sm ${
                      s.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {s.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-20 md:pt-24 md:pb-24">
        <div className="safe-pad-x mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl tracking-tight text-stone-950 sm:text-4xl md:text-5xl">
            Join the waitlist
          </h2>
          <p className="mt-3 text-base text-stone-600 sm:mt-4 sm:text-lg">
            Get notified when the app launches on Nexora Fuji testnet. Free test USDC included.
          </p>
          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <JoinWaitlist variant="cta" />
            <ComingSoon variant="cta" />
          </div>
        </div>
      </section>

      <footer className="safe-pad-bottom border-t border-stone-200 bg-white py-10 sm:py-12">
        <div className="safe-pad-x mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-serif text-2xl text-stone-950">Nexora.</div>
              <p className="mt-2 text-sm text-stone-500">Trade tokenized stocks on chain.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-600">
              <a href="#features" className="py-1 hover:text-stone-950">
                Features
              </a>
              <a href="#how-it-works" className="py-1 hover:text-stone-950">
                How it works
              </a>
              <a href="#markets" className="py-1 hover:text-stone-950">
                Markets
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1 hover:text-stone-950"
              >
                <XIcon className="h-3.5 w-3.5" />
                X
              </a>
              <Link href={APP_URL} className="py-1 text-stone-400">
                App coming soon
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-400 sm:pt-8">
            Nexora is a demo platform. This is not financial advice. Trade at your own risk.
          </div>
        </div>
      </footer>
    </div>
  );
}
