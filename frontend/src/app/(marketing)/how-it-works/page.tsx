import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound, Landmark, Layers, Wallet } from "lucide-react";

import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { HowItWorks } from "@/components/marketing/sections/HowItWorks";
import { Technology } from "@/components/marketing/sections/Technology";
import { WaitlistCta } from "@/components/marketing/sections/WaitlistCta";
import { faqs } from "@/lib/site";
import { FaqList } from "@/components/marketing/sections/FaqSection";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What a tokenized stock actually is, what self-custody means in practice, and exactly what happens between tapping buy and owning the token.",
  alternates: { canonical: "/how-it-works" },
};

const anatomy = [
  {
    icon: Landmark,
    title: "The underlying",
    body: "A real listed company — say Apple — with a price discovered on public markets every second of every session.",
  },
  {
    icon: Layers,
    title: "The token",
    body: "xAAPL: an ERC-20 contract whose price tracks that company one-to-one. It has 18 decimals, so it divides as finely as you like.",
  },
  {
    icon: Wallet,
    title: "The balance",
    body: "Your position is simply how many xAAPL your address holds. Read it from the chain, from Nexora, or from any wallet.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            No magic. Just a token,
            <br />
            <span className="text-gradient-mint">a price, and a signature.</span>
          </>
        }
        lead="If you understand a bank transfer, you can understand this. Here is the whole mechanism, in plain language, including the parts most platforms would rather gloss over."
      />

      <HowItWorks id="steps" />

      {/* What is a tokenized stock */}
      <Section id="tokenized" className="scroll-mt-32 py-24 sm:py-28">
        <SectionHeading
          eyebrow="Anatomy"
          title="What a tokenized stock actually is."
          lead="Three parts, and it is worth being precise about each one — especially about what you are not getting."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {anatomy.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="glass flex h-full flex-col rounded-3xl p-7">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-mint/22 bg-mint/10 text-mint">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-chalk">{title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ash">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-8">
          <div className="rounded-3xl border border-ember/25 bg-ember/5 p-7 sm:p-8">
            <p className="eyebrow !text-ember">Be clear on this</p>
            <p className="mt-4 max-w-3xl text-[15.5px] leading-relaxed text-ash">
              An equity token gives you <span className="text-chalk">price exposure</span>, not
              company ownership. You do not become a shareholder of record. There are no voting
              rights, no dividend stream, and no shareholder communications. If those matter to
              you, a traditional broker is the right tool and we will happily say so.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Self-custody */}
      <Section id="custody" className="scroll-mt-32 py-24 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <SectionHeading
            eyebrow="Custody"
            title={
              <>
                Self-custody,
                <br />
                without the lecture.
              </>
            }
            lead="Non-custodial means one thing: the assets are at an address only you can spend from. That is a genuine upgrade, and it comes with a genuine responsibility."
          />

          <Reveal delay={100} className="space-y-5">
            <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-chalk">
                <KeyRound size={16} className="text-mint" />
                What you gain
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ash">
                Nobody can freeze your position, lend it out, or halt your withdrawal. You do not
                need our permission to move your tokens, and if Nexora disappeared tomorrow your
                balances would still be exactly where you left them.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-chalk">
                <KeyRound size={16} className="text-ember" />
                What you take on
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ash">
                Losing your keys means losing access, and there is no support line that can undo
                it. If you sign in with Google, Nexora provisions an embedded wallet to smooth
                the first mile — but the moment real money is involved, use a wallet whose
                recovery phrase you have written down and stored offline.
              </p>
            </div>

            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-[14px] text-chalk underline-offset-4 transition-colors hover:text-mint hover:underline"
            >
              Read the full FAQ
              <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </Section>

      <Technology />

      <Section className="pb-24 sm:pb-28">
        <SectionHeading eyebrow="Still wondering" title="Common follow-ups." />
        <div className="mt-10">
          <FaqList items={faqs.slice(0, 5)} />
        </div>
      </Section>

      <WaitlistCta />
    </>
  );
}
