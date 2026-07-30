"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Users } from "lucide-react";
import axios from "axios";

interface WaitlistFormProps {
  variant?: "hero" | "section";
  onSuccess?: (count: number) => void;
}

export function WaitlistForm({ variant = "section", onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await axios.post("/api/waitlist", {
        email: email.trim(),
        name: name.trim() || undefined,
      });

      setStatus("success");
      setMessage(res.data.message);
      if (typeof res.data.count === "number") {
        setWaitlistCount(res.data.count);
        onSuccess?.(res.data.count);
      }
    } catch (err: unknown) {
      setStatus("error");
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  const isHero = variant === "hero";

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="landing-glass rounded-2xl p-6 md:p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">You&apos;re on the list!</h3>
        <p className="text-[var(--landing-muted)] text-sm md:text-base mb-4">{message}</p>
        {waitlistCount !== null && (
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-300">
            <Users className="w-4 h-4" />
            <span>{waitlistCount.toLocaleString()} traders already waiting</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={isHero ? "w-full max-w-xl" : "w-full max-w-lg mx-auto"}>
      <div
        className={`landing-glass rounded-2xl p-4 md:p-5 ${isHero ? "landing-shine" : ""}`}
      >
        {!isHero && (
          <div className="flex items-center gap-2 mb-4 text-cyan-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Early access · Founding member perks
          </div>
        )}

        <div className={`flex flex-col gap-3 ${isHero ? "md:flex-row md:items-center" : ""}`}>
          {!isHero && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="landing-input"
              aria-label="Name"
            />
          )}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="landing-input flex-1"
            required
            aria-label="Email"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={`landing-btn-primary ${isHero ? "md:shrink-0" : "w-full"}`}
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {status === "error" && message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-sm text-red-400"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="mt-3 text-xs text-[var(--landing-muted)] text-center md:text-left">
          No spam. Unsubscribe anytime. By joining you agree to receive launch updates.
        </p>
      </div>
    </form>
  );
}
