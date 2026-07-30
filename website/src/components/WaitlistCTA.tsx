import { Rocket } from "lucide-react";
import WaitlistForm from "./WaitlistForm";
import LiveWaitlistCount from "./LiveWaitlistCount";
import Reveal from "./Reveal";

export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="relative mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <div className="glass-card relative overflow-hidden rounded-[32px] px-6 py-14 text-center sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full opacity-40 blur-[110px]"
            style={{ background: "radial-gradient(ellipse, #8b5cf6, transparent 65%)" }}
          />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Rocket size={22} className="text-[#05060a]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be first through the door
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/60">
              Founding members get priority beta access, a direct line to the team, and
              first pick of onboarding perks when we open the gates.
            </p>

            <div className="mx-auto mt-9 max-w-md">
              <WaitlistForm size="lg" />
            </div>

            <div className="mt-6 flex justify-center">
              <LiveWaitlistCount />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
