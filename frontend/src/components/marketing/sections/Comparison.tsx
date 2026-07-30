import { comparison, site } from "@/lib/site";
import { Reveal } from "../Reveal";
import { Section, SectionHeading } from "../Section";

export function Comparison() {
  return (
    <Section className="py-24 sm:py-32">
      <SectionHeading
        eyebrow="Side by side"
        title="Where the differences actually bite."
        lead="Nexora is not trying to be a better-looking broker. The change is structural: who holds your assets, and how quickly you can act."
        align="center"
      />

      <Reveal delay={100} className="mt-14">
        <div className="ring-gradient overflow-hidden rounded-3xl bg-panel/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-5 text-[12px] font-normal tracking-[0.16em] text-smoke uppercase">
                    &nbsp;
                  </th>
                  {comparison.columns.map((col) => (
                    <th
                      key={col}
                      className={`px-6 py-5 text-[13px] font-semibold ${
                        col === site.name ? "text-mint" : "text-ash"
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label} className="border-b border-white/6 last:border-0">
                    <th
                      scope="row"
                      className="px-6 py-4 text-[14px] font-normal text-ash whitespace-nowrap"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={`px-6 py-4 text-[14px] ${
                          i === 0
                            ? "bg-mint/4 font-medium text-chalk"
                            : "text-smoke"
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
