import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { heroRotators, site, trustPoints } from "@/lib/site";
import { PhoneMockup } from "../PhoneMockup";
import { Reveal } from "../Reveal";
import { RotatingWord } from "../RotatingWord";
import { WaitlistForm } from "../WaitlistForm";
import { WaitlistPulse } from "../WaitlistPulse";

export function Hero() {
  return (
    <section className="bg-noise vignette relative isolate overflow-hidden pt-[calc(var(--nav-h)+3.5rem)] pb-20 sm:pt-[calc(var(--nav-h)+5rem)] lg:pb-28">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="orb -top-32 -left-24 h-[30rem] w-[30rem] animate-drift bg-mint/16" />
        <div className="orb top-10 right-[-12rem] h-[34rem] w-[34rem] animate-drift bg-iris/14 [animation-delay:-6s]" />
        <div className="orb bottom-[-14rem] left-1/3 h-[26rem] w-[26rem] bg-ember/10" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        {/* Copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/4 py-1.5 pr-4 pl-2 text-[12.5px] text-ash backdrop-blur">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute h-4 w-4 animate-pulse-ring rounded-full bg-mint/70" />
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Private beta live on {site.chain}
            </span>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="display mt-7 text-[clamp(2.9rem,7.4vw,5.1rem)] text-chalk">
              Own a slice of{" "}
              <RotatingWord words={heroRotators} wordClassName="text-gradient-mint" />
              <br />
              in about ten seconds.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ash sm:text-[18.5px]">
              {site.name} turns listed equities into tokens you hold in your own wallet. Fund
              with {site.settlement}, buy the fraction you want, and settle on-chain — no
              brokerage account, no custodian, no waiting for the opening bell.
            </p>
          </Reveal>

          <Reveal delay={210} className="mt-9">
            <div id="waitlist-hero">
              <WaitlistForm source="hero" />
            </div>
          </Reveal>

          <Reveal delay={280} className="mt-8">
            <WaitlistPulse />
          </Reveal>

          <Reveal delay={340}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[13.5px] text-ash">
                  <Check size={14} className="shrink-0 text-mint" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={400}>
            <Link
              href="/how-it-works"
              className="mt-9 inline-flex items-center gap-1.5 text-[14px] text-chalk underline-offset-4 transition-colors hover:text-mint hover:underline"
            >
              See exactly how a trade works
              <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>

        {/* Device */}
        <Reveal delay={180} className="relative flex flex-col items-center lg:items-end">
          <div className="relative animate-float">
            <PhoneMockup />

            <span className="glass absolute -top-4 -left-6 hidden items-center gap-2 rounded-full px-3.5 py-2 text-[12px] text-chalk sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Settled on-chain
            </span>
          </div>

          <p className="mt-9 text-center text-[12.5px] text-smoke lg:text-right">
            Live prices · your wallet · on-chain settlement
          </p>
        </Reveal>
      </div>
    </section>
  );
}
