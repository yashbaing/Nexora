import { steps } from "@/lib/site";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

export function HowItWorks({ id = "how" }: { id?: string }) {
  return (
    <Section id={id} className="py-24 sm:py-32">
      <SectionHeading
        eyebrow="Four steps"
        title={
          <>
            From curious to invested,
            <br />
            <span className="text-gradient-mint">without a single form.</span>
          </>
        }
        lead="No onboarding queue, no minimum deposit, no phone call. Here is the entire journey."
      />

      <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.n} delay={i * 90} className="relative">
            {/* Connector rail between steps on wide screens */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-[18px] left-[calc(2.6rem)] hidden h-px w-[calc(100%-1.2rem)] bg-gradient-to-r from-mint/40 to-transparent lg:block"
              />
            )}

            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-mint/30 bg-mint/10 font-mono text-[12px] font-semibold text-mint">
                {step.n}
              </span>
            </span>

            <h3 className="mt-5 text-[19px] font-semibold tracking-tight text-chalk">
              {step.title}
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ash">{step.body}</p>
            <p className="mt-4 font-mono text-[11.5px] tracking-wide text-smoke">{step.detail}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
