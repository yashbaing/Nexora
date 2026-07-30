import { Plus } from "lucide-react";

import { faqs, type Faq } from "@/lib/site";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return (
    <div className="divide-y divide-white/8 border-y border-white/8">
      {items.map((faq, i) => (
        <Reveal key={faq.q} delay={Math.min(i * 45, 260)}>
          <details className="group">
            <summary className="flex items-start justify-between gap-6 py-6 text-left transition-colors hover:text-mint">
              <h3 className="text-[16.5px] font-medium tracking-tight text-chalk group-hover:text-mint sm:text-[17.5px]">
                {faq.q}
              </h3>
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/12 bg-white/4 text-ash transition-transform duration-300 group-open:rotate-45 group-open:border-mint/40 group-open:text-mint">
                <Plus size={14} />
              </span>
            </summary>
            <p className="max-w-3xl pb-7 text-[15px] leading-relaxed text-ash">{faq.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

export function FaqSection({ items }: { items?: Faq[] }) {
  return (
    <Section id="faq" className="py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title={
            <>
              The things people
              <br />
              ask us first.
            </>
          }
          lead="Straight answers, including on the parts that are still in progress."
        />
        <FaqList items={items} />
      </div>
    </Section>
  );
}
