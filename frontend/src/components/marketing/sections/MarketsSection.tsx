import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketsPreview } from "../MarketsGrid";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

export function MarketsSection() {
  return (
    <Section id="markets" className="py-24 sm:py-32">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Listings"
          title={
            <>
              Twelve of the world&apos;s
              <br />
              most-watched companies.
            </>
          }
          lead="US megacaps alongside Indian large caps, each one a token you can hold in your own wallet. More listings arrive with every cohort."
        />
        <Reveal delay={90}>
          <Link href="/markets" className="btn btn-ghost">
            Browse every market
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>

      <Reveal delay={120} className="mt-12">
        <MarketsPreview limit={6} />
      </Reveal>

      <p className="mt-6 text-[12.5px] text-smoke">
        Prices are indicative and drawn from a market-linked feed for demonstration while
        Nexora is on testnet.
      </p>
    </Section>
  );
}
