import { Check, X } from "lucide-react";

import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

const before = [
  "Days of paperwork before your first order",
  "Whole shares only, so a $900 stock is out of reach",
  "Closed evenings, weekends and public holidays",
  "Your assets sit on someone else's balance sheet",
  "A monthly statement is the only proof you get",
];

const after = [
  "One signature and you're trading",
  "Buy $4 of anything — tokens carry 18 decimals",
  "The contract never closes, so neither do you",
  "Positions are ERC-20 balances in your wallet",
  "Every trade is a transaction anyone can verify",
];

export function Contrast() {
  return (
    <Section id="why" className="py-24 sm:py-32">
      <SectionHeading
        eyebrow="Why we built it"
        title={
          <>
            The stock market still runs on
            <span className="text-gradient-fade"> plumbing from 1975.</span>
          </>
        }
        lead="Equities are the world's most important asset class and the hardest to actually reach. Nexora rebuilds the last mile — the part between deciding to buy and owning the thing — on infrastructure that settles in seconds and never shuts."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <Reveal className="rounded-3xl border border-white/8 bg-white/2 p-7 sm:p-9">
          <p className="eyebrow">The way it works now</p>
          <ul className="mt-6 space-y-4">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/10 bg-white/4 text-smoke">
                  <X size={11} />
                </span>
                <span className="text-[15px] leading-relaxed text-smoke">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={110}
          className="ring-gradient relative overflow-hidden rounded-3xl bg-panel/70 p-7 sm:p-9"
        >
          <div className="orb -top-20 -right-16 h-52 w-52 bg-mint/16" />
          <p className="eyebrow !text-mint relative">The way it works here</p>
          <ul className="relative mt-6 space-y-4">
            {after.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-mint/30 bg-mint/12 text-mint">
                  <Check size={11} />
                </span>
                <span className="text-[15px] leading-relaxed text-chalk">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
