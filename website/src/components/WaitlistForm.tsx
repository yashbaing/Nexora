"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { joinWaitlist } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm({
  size = "md",
}: {
  size?: "md" | "lg";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const referrer =
        typeof document !== "undefined" ? document.referrer || "direct" : "direct";
      const res = await joinWaitlist({ email: trimmed, referrer });
      setPosition(res.position);
      setMessage(res.message);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      const apiMessage =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error;
      setMessage(
        apiMessage ||
          "We couldn't reach our servers. Please try again in a moment."
      );
    }
  };

  const inputPad = size === "lg" ? "py-4 px-5 text-base" : "py-3.5 px-4 text-sm";
  const btnPad = size === "lg" ? "py-4 px-7 text-base" : "py-3.5 px-6 text-sm";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-6 py-7 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <PartyPopper size={24} />
            </div>
            <p className="text-lg font-semibold text-white">{message}</p>
            {position !== null && (
              <p className="font-mono-num text-sm text-emerald-300">
                You&apos;re <span className="font-bold">#{position.toLocaleString()}</span> in line
              </p>
            )}
            <p className="max-w-xs text-sm text-white/50">
              We&apos;ll email you the moment your invite is ready. Keep an eye on your inbox.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
            noValidate
          >
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@email.com"
                className={`w-full rounded-full border bg-white/[0.04] text-white placeholder-white/35 outline-none transition-colors ${inputPad} ${
                  status === "error"
                    ? "border-rose-400/60 focus:border-rose-400"
                    : "border-white/15 focus:border-violet-400/70"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className={`btn-shimmer group relative flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 ${btnPad}`}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 pl-2 text-sm text-rose-400"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {status === "idle" && (
        <p className="mt-3 flex items-center gap-1.5 pl-2 text-xs text-white/35">
          <CheckCircle2 size={13} className="text-white/30" />
          No spam. No wallet needed to join. Unsubscribe anytime.
        </p>
      )}
    </div>
  );
}
