"use client";

import { motion } from "framer-motion";
import { Gift, Star, Trophy, Users } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

const PERKS = [
  {
    icon: Star,
    title: "Founding member badge",
    description: "Exclusive profile badge for early waitlist members.",
  },
  {
    icon: Gift,
    title: "Launch day perks",
    description: "Bonus mock USDC and zero-fee trades during beta.",
  },
  {
    icon: Trophy,
    title: "Priority access",
    description: "Get invited before public launch — first to trade.",
  },
  {
    icon: Users,
    title: "Community channel",
    description: "Private Discord for product feedback and alpha.",
  },
];

export function WaitlistSection() {
  return (
    <section id="waitlist" className="landing-section relative overflow-hidden">
      <div
        className="landing-gradient-orb w-[600px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 bg-violet-600/20"
        aria-hidden
      />

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            Get early access to{" "}
            <span className="landing-gradient-text">Tokenssized</span>
          </motion.h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            Join the waitlist today. We&apos;re onboarding traders in waves — don&apos;t miss the first wave.
          </p>
        </div>

        <WaitlistForm variant="section" />

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <perk.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{perk.title}</h3>
                <p className="text-sm text-zinc-400">{perk.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
