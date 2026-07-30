import type { Metadata } from "next";

import { MarketsExplorer } from "@/components/marketing/MarketsGrid";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { TickerTape } from "@/components/marketing/TickerTape";
import { WaitlistCta } from "@/components/marketing/sections/WaitlistCta";
import { SEED_MARKETS } from "@/lib/markets";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Every equity token on Nexora — Apple, NVIDIA, Tesla, Microsoft, Alphabet, Amazon, Meta, JPMorgan, Coca-Cola, Infosys, Reliance and TCS, priced from a live market feed.",
  alternates: { canonical: "/markets" },
};

export default function MarketsPage() {
  const regions = new Set(SEED_MARKETS.map((m) => m.region));
  const sectors = new Set(SEED_MARKETS.map((m) => m.sector));

  return (
    <>
      <PageHero
        eyebrow="Markets"
        title={
          <>
            Every listing, <span className="text-gradient-mint">live.</span>
          </>
        }
        lead={`${SEED_MARKETS.length} tokenized equities across ${sectors.size} sectors and ${regions.size} regions. Each one is an ERC-20 token that tracks its underlying company and settles in USDC.`}
      />

      <TickerTape />

      <Section className="py-16 sm:py-20">
        <MarketsExplorer />

        <div className="mt-12 rounded-2xl border border-white/8 bg-white/2 p-5">
          <p className="text-[12.5px] leading-relaxed text-smoke">
            Prices update while this page is open and are indicative only: Nexora is on
            testnet, and quotes are drawn from a market-linked feed for demonstration. An
            equity token tracks the price of its underlying company and carries no ownership,
            voting or dividend rights. Nothing on this page is investment advice.
          </p>
        </div>
      </Section>

      <WaitlistCta />
    </>
  );
}
