import type { Metadata } from "next";

import { site } from "@/lib/site";
import { TickerTape } from "@/components/marketing/TickerTape";
import { Comparison } from "@/components/marketing/sections/Comparison";
import { Contrast } from "@/components/marketing/sections/Contrast";
import { FaqSection } from "@/components/marketing/sections/FaqSection";
import { FeatureBento } from "@/components/marketing/sections/FeatureBento";
import { Hero } from "@/components/marketing/sections/Hero";
import { HowItWorks } from "@/components/marketing/sections/HowItWorks";
import { MarketsSection } from "@/components/marketing/sections/MarketsSection";
import { Roadmap } from "@/components/marketing/sections/Roadmap";
import { StatsBand } from "@/components/marketing/sections/StatsBand";
import { Technology } from "@/components/marketing/sections/Technology";
import { WaitlistCta } from "@/components/marketing/sections/WaitlistCta";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a tokenized stock?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An ERC-20 token that tracks the price of a single listed company one-to-one. It gives you price exposure held in your own wallet, not a share certificate.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a brokerage account to use Nexora?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You connect a wallet or sign in with Google, fund the wallet with USDC, and trade. Nexora is non-custodial and there is no account to open.",
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled payload — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Hero />
      <TickerTape />
      <Contrast />
      <HowItWorks />
      <StatsBand />
      <FeatureBento />
      <MarketsSection />
      <Technology />
      <Comparison />
      <Roadmap />
      <FaqSection />
      <WaitlistCta />
      <TickerTape reverse />
    </>
  );
}
