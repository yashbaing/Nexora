import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

export function Section({
  id,
  children,
  className = "",
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      {bleed ? children : <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display mt-4 text-[clamp(2.1rem,5vw,3.6rem)] text-chalk">{title}</h2>
      {lead && (
        <p className="mt-5 text-[16.5px] leading-relaxed text-ash sm:text-[17.5px]">{lead}</p>
      )}
    </Reveal>
  );
}
