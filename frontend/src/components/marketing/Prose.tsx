import type { ReactNode } from "react";

/** Long-form text styling for the legal pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        max-w-3xl
        [&_a]:text-mint [&_a]:underline-offset-4 [&_a:hover]:underline
        [&_h2]:display [&_h2]:mt-14 [&_h2]:scroll-mt-32 [&_h2]:text-[26px] [&_h2]:text-chalk sm:[&_h2]:text-[30px]
        [&_h3]:mt-9 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-chalk
        [&_li]:mt-2.5 [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:text-ash
        [&_p]:mt-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-ash
        [&_strong]:font-semibold [&_strong]:text-chalk
        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-mint/50
      "
    >
      {children}
    </div>
  );
}
