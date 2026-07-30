import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-noise relative isolate overflow-hidden pt-[calc(var(--nav-h)+4rem)] pb-14 sm:pt-[calc(var(--nav-h)+5.5rem)] sm:pb-20">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="orb -top-40 left-1/4 h-[24rem] w-[34rem] bg-mint/12" />
        <div className="orb -top-20 right-0 h-72 w-72 bg-iris/12" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.6rem,6.4vw,4.4rem)] text-chalk">
            {title}
          </h1>
          {lead && (
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ash sm:text-[18px]">
              {lead}
            </p>
          )}
        </Reveal>
        {children && <Reveal delay={110} className="mt-9">{children}</Reveal>}
      </div>
    </section>
  );
}
