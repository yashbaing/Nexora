"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is Tokenssized?",
    a: "Tokenssized is a Web3 platform for trading tokenized equities on Avalanche. You can buy and sell on-chain representations of stocks like Apple, Tesla, and NVIDIA with real-time market data and instant settlement.",
  },
  {
    q: "Are these real stocks?",
    a: "Our tokens (xAAPL, xTSLA, etc.) are on-chain ERC-20 tokens that represent tokenized equity exposure through our smart contract platform. They are designed for trading and portfolio tracking on-chain.",
  },
  {
    q: "When will the app launch?",
    a: "We're in private beta now. Waitlist members will receive invites in waves — join early for priority access to the first public release.",
  },
  {
    q: "Do I need crypto experience?",
    a: "Not necessarily. You can sign in with Google to get an embedded wallet automatically, or connect MetaMask if you prefer. We guide you through every step.",
  },
  {
    q: "What blockchain is this on?",
    a: "Tokenssized runs on Avalanche C-Chain for fast, low-cost transactions. Our contracts handle USDC settlement and token minting/burning securely.",
  },
  {
    q: "Is there a cost to join the waitlist?",
    a: "No — joining is completely free. We'll only email you about launch updates and early access invites.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="landing-section">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-fuchsia-400 text-sm font-medium tracking-wide uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Questions? We&apos;ve got answers.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className="landing-glass rounded-xl overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 p-5 text-left font-medium hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
