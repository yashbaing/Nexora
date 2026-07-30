import { roadmap } from "@/lib/site";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

const badge = {
  done: { label: "Shipped", className: "border-mint/30 bg-mint/12 text-mint" },
  active: { label: "In progress", className: "border-ember/35 bg-ember/12 text-ember" },
  next: { label: "Planned", className: "border-white/12 bg-white/5 text-smoke" },
} as const;

export function Roadmap() {
  return (
    <Section id="roadmap" className="py-24 sm:py-32">
      <SectionHeading
        eyebrow="Where we are"
        title={
          <>
            Honest about what&apos;s built
            <br />
            and what isn&apos;t.
          </>
        }
        lead="Nexora is pre-launch, and we would rather you know precisely what that means before you join the queue."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {roadmap.map((phase, i) => {
          const tag = badge[phase.status];
          return (
            <Reveal key={phase.phase} delay={i * 80}>
              <article
                className={`flex h-full flex-col rounded-3xl border p-7 ${
                  phase.status === "active"
                    ? "border-ember/25 bg-ember/4"
                    : "border-white/8 bg-white/2"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow">{phase.phase}</p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10.5px] tracking-wider uppercase ${tag.className}`}
                  >
                    {tag.label}
                  </span>
                </div>

                <h3 className="display mt-4 text-[26px] text-chalk">{phase.title}</h3>

                <ul className="mt-5 space-y-3">
                  {phase.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[14px] leading-relaxed text-ash">
                      <span
                        className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                          phase.status === "next" ? "bg-white/22" : "bg-mint"
                        }`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
