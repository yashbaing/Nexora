import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { Section } from "@/components/marketing/Section";
import { FaqList } from "@/components/marketing/sections/FaqSection";
import { WaitlistCta } from "@/components/marketing/sections/WaitlistCta";
import { faqs, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers about tokenized equities, custody, pricing, fees and launch timing on Nexora.",
  alternates: { canonical: "/faq" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled payload — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Everything worth
            <br />
            <span className="text-gradient-mint">asking first.</span>
          </>
        }
        lead={`If something here is unclear, that's on us — tell us and we'll rewrite it. ${site.name} is pre-launch, and we would rather over-explain than oversell.`}
      />

      <Section className="pb-20">
        <FaqList />

        <Reveal delay={120} className="mt-14">
          <div className="ring-gradient relative overflow-hidden rounded-3xl bg-panel/70 p-8 sm:p-10">
            <h2 className="display text-[28px] text-chalk sm:text-[34px]">
              Question we haven&apos;t answered?
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ash">
              Join the waitlist and reply to the welcome email — it reaches the people building
              this, not a ticketing queue.
            </p>
            <Link href="/#waitlist" className="btn btn-primary mt-7">
              Join the waitlist
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
      </Section>

      <WaitlistCta />
    </>
  );
}
