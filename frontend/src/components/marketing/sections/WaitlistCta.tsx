import { Gift, MailCheck, Timer } from "lucide-react";

import { Reveal } from "../Reveal";
import { WaitlistForm } from "../WaitlistForm";
import { WaitlistPulse } from "../WaitlistPulse";

const perks = [
  {
    icon: Timer,
    title: "First through the door",
    body: "Invites go out in queue order, in cohorts small enough for us to actually support.",
  },
  {
    icon: Gift,
    title: "Testnet funds on arrival",
    body: "Your account is pre-funded so you can trade the full product before mainnet money is involved.",
  },
  {
    icon: MailCheck,
    title: "One email a month, at most",
    body: "Launch news and what changed. Nothing else, and unsubscribing is one click.",
  },
];

export function WaitlistCta() {
  return (
    <section id="waitlist" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0" />
        <div className="orb -bottom-40 left-1/2 h-[32rem] w-[46rem] -translate-x-1/2 bg-mint/14" />
        <div className="orb top-0 right-0 h-72 w-72 bg-iris/12" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="ring-gradient relative overflow-hidden rounded-[2rem] bg-panel/70 px-6 py-14 backdrop-blur-xl sm:px-12 sm:py-16">
          <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="eyebrow">Early access</p>
                <h2 className="display mt-4 text-[clamp(2.3rem,5.4vw,3.9rem)] text-chalk">
                  Get in before
                  <br />
                  <span className="text-gradient-mint">the doors open.</span>
                </h2>
                <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-ash">
                  Places are allocated in the order they&apos;re claimed. Drop your email, keep
                  your link, and you&apos;ll be trading tokenized equities while everyone else is
                  still filling in a broker application.
                </p>
              </Reveal>

              <Reveal delay={110} className="mt-9">
                <WaitlistForm variant="panel" source="cta" />
              </Reveal>

              <Reveal delay={180} className="mt-8">
                <WaitlistPulse />
              </Reveal>
            </div>

            <Reveal delay={140}>
              <ul className="space-y-5">
                {perks.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4 rounded-2xl border border-white/8 bg-white/2 p-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-mint/22 bg-mint/10 text-mint">
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-chalk">{title}</span>
                      <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ash">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
