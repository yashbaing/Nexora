import { ExternalLink } from "lucide-react";

import { deployment, pipeline, site } from "@/lib/site";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

const truncate = (address: string) => `${address.slice(0, 8)}…${address.slice(-6)}`;

export function Technology() {
  const facts = [
    { label: "Network", value: deployment.network },
    { label: "Chain ID", value: deployment.chainId },
    { label: "Settlement", value: `${site.settlement} · 6 decimals` },
    { label: "Equity tokens", value: deployment.tokenStandard },
    { label: "Quote authenticity", value: deployment.quoteScheme },
  ];

  return (
    <Section id="technology" className="py-24 sm:py-32">
      <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Under the hood"
            title={
              <>
                Anyone can check
                <br />
                <span className="text-gradient-mint">our arithmetic.</span>
              </>
            }
            lead="A trade on Nexora is four moves, and each one leaves a trace you can inspect yourself. No internal ledger to take on faith."
          />

          <ol className="mt-12 space-y-6">
            {pipeline.map((item, i) => (
              <Reveal as="li" key={item.step} delay={i * 80} className="flex gap-5">
                <span className="mt-1 flex flex-col items-center">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/12 bg-white/5 font-mono text-[11px] text-mint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span aria-hidden className="mt-2 h-full w-px flex-1 bg-gradient-to-b from-white/14 to-transparent" />
                  )}
                </span>
                <span className="pb-1">
                  <span className="block font-mono text-[12px] tracking-[0.16em] text-chalk uppercase">
                    {item.step}
                  </span>
                  <span className="mt-2 block text-[14.5px] leading-relaxed text-ash">
                    {item.body}
                  </span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={140}>
          <div className="ring-gradient relative overflow-hidden rounded-3xl bg-panel/70 p-7 backdrop-blur-xl sm:p-8">
            <div className="orb -top-24 -left-20 h-56 w-56 bg-iris/18" />

            <div className="relative flex items-center justify-between">
              <p className="eyebrow">Deployment</p>
              <span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-[10.5px] tracking-wider text-mint uppercase">
                Testnet
              </span>
            </div>

            <dl className="relative mt-6 space-y-0">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 border-b border-white/6 py-3.5 last:border-0"
                >
                  <dt className="text-[13px] text-smoke">{fact.label}</dt>
                  <dd className="text-right font-mono text-[12.5px] text-chalk">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="relative mt-6 rounded-2xl border border-white/8 bg-void/60 p-4">
              <p className="eyebrow !text-[10px]">Platform contract</p>
              <a
                href={`${deployment.explorer}/address/${deployment.platform}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-2 font-mono text-[12.5px] text-mint transition-opacity hover:opacity-80"
              >
                {truncate(deployment.platform)}
                <ExternalLink size={12} />
              </a>
              <p className="mt-3 text-[12.5px] leading-relaxed text-smoke">
                Balances, mints and every settled trade are readable straight from the chain.
                We publish the address so you never have to ask us for a statement.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
