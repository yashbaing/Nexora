import { STEPS } from "@/lib/data";
import Reveal from "./Reveal";

export default function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          How it works
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          From waitlist to your first trade
        </h2>
        <p className="mt-4 text-white/55">Four steps. No paperwork, no waiting on a broker.</p>
      </Reveal>

      <div className="relative mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08}>
            <div className="relative flex flex-col items-start">
              <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#0a0d16] font-mono-num text-lg font-bold text-white">
                <span className="gradient-text">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
