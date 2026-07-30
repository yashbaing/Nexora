import {
  Zap,
  PieChart,
  Globe2,
  ShieldCheck,
  FileSignature,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { FEATURES } from "@/lib/data";
import Reveal from "./Reveal";

const ICONS: Record<string, LucideIcon> = {
  Zap,
  PieChart,
  Globe2,
  ShieldCheck,
  FileSignature,
  Wallet,
};

export default function Features() {
  return (
    <section id="why" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
          Why Nexora
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Trading, rebuilt for a world without borders or brokers
        </h2>
        <p className="mt-4 text-white/55">
          Every feature below is live on our testnet today — not a roadmap promise.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const Icon = ICONS[feature.icon];
          return (
            <Reveal key={feature.title} delay={i * 0.06}>
              <div className="group glass-card relative h-full overflow-hidden rounded-2xl p-6 transition-colors hover:border-white/20">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
                />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-violet-200">
                  {Icon && <Icon size={22} />}
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{feature.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
