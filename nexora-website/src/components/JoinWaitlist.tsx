"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail, Sparkles, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

type Variant = "nav" | "cta" | "hero";

export default function JoinWaitlist({ variant = "nav" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = () => {
    setJoined(false);
    setMessage("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Something went wrong. Please try again.");
      } else {
        setMessage(data?.message || "You're on the waitlist!");
        setJoined(true);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const buttonClass =
    variant === "nav"
      ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
      : variant === "hero"
        ? "inline-flex items-center gap-2 rounded-full bg-[#f0a35e] px-8 py-3.5 text-sm font-semibold text-[#0b0e13] shadow-lg shadow-black/30 transition hover:bg-[#f4b57a]"
        : "inline-flex items-center gap-2 rounded-full bg-[#07090d] px-10 py-4 text-sm font-semibold text-white transition hover:bg-[#1a1f28]";

  return (
    <>
      <button type="button" onClick={openModal} className={buttonClass}>
        <Sparkles className={`h-4 w-4 ${variant === "hero" ? "text-[#0b0e13]" : "text-[#f0a35e]"}`} />
        Join Waitlist
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-modal-in relative w-full max-w-[300px] rounded-2xl bg-white p-5 shadow-xl shadow-stone-950/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {joined ? (
              <div className="pt-1 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-stone-950">
                  You&apos;re on the waitlist
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  {message || "We'll email you when Nexora launches."}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#07090d] text-[#f0a35e]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-950">Join the waitlist</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">
                  Enter your email and we&apos;ll notify you when the app is ready.
                </p>

                <form onSubmit={submit} className="mt-4 flex flex-col gap-2.5">
                  <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      autoFocus
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
                    />
                  </div>

                  {message && (
                    <p className="text-left text-[11px] text-red-600">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                  >
                    {submitting ? "Submitting…" : "Join waitlist"}
                    {!submitting && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>

                  <p className="text-center text-[10px] text-stone-400">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
