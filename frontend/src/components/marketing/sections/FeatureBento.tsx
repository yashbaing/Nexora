import { features } from "@/lib/site";
import { FeatureIcon } from "../FeatureIcon";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

export function FeatureBento() {
  return (
    <Section id="features" className="py-24 sm:py-32">
      <SectionHeading
        eyebrow="Inside the platform"
        title={
          <>
            Built like a trading desk,
            <br />
            not a crypto experiment.
          </>
        }
        lead="Every part of Nexora exists to answer one question: can you trust the price you were shown, and the balance you were given?"
      />

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal
            key={feature.title}
            delay={i * 70}
            className={feature.span === "wide" ? "lg:col-span-2" : ""}
          >
            <article className="glass glass-hover flex h-full flex-col rounded-3xl p-7">
              <FeatureIcon name={feature.icon} />
              <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-chalk">
                {feature.title}
              </h3>
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ash">{feature.body}</p>
              {feature.stat && (
                <p className="mt-6 border-t border-white/8 pt-4 font-mono text-[11.5px] tracking-wide text-mint/80">
                  {feature.stat}
                </p>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
