import { stats } from "@/lib/site";
import { Reveal } from "../Reveal";

export function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-abyss py-16 sm:py-20">
      <div aria-hidden className="bg-dots absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <p className="display text-gradient-mint text-[clamp(2.6rem,6vw,3.6rem)] leading-none">
              {stat.value}
            </p>
            <p className="mt-3 text-[14.5px] font-medium text-chalk">{stat.label}</p>
            <p className="mt-1 text-[13px] text-smoke">{stat.sub}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
