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
      ? "inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:border-stone-300 hover:bg-stone-50"
      : variant === "hero"
        ? "inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-black/20 transition hover:bg-stone-200"
        : "inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-950/10 transition hover:bg-stone-800";

  return (
    <>
      <button type="button" onClick={openModal} className={buttonClass}>
        <Sparkles className="h-4 w-4 text-orange-500" />
        Join Waitlist
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-modal-in relative w-full max-w-[380px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-stone-950/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-950"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Top banner */}
            <div className="relative overflow-hidden bg-stone-950">
              <div className="dark-hero-glow dark-grid-pattern absolute inset-0" />
              <div className="relative flex flex-col items-center justify-center px-8 pb-8 pt-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="mt-4 font-serif text-2xl tracking-tight text-white">
                  {joined ? "You're on the list" : "Get early access"}
                </h3>
                <p className="mt-1.5 text-sm text-stone-400">
                  {joined
                    ? "We'll email you the moment Nexora opens up."
                    : "Be first in line when Nexora opens to the public."}
                </p>
              </div>
            </div>

            <div className="px-7 py-7">
              {joined ? (
                <>
                  <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <Check className="h-5 w-5" />
                  </div>
                  {message && (
                    <p className="text-center text-sm text-stone-500">{message}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-6 w-full rounded-xl bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Done
                  </button>
                </>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      autoFocus
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white"
                    />
                  </div>

                  {message && (
                    <p className="-mt-1 text-left text-xs text-red-600">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                  >
                    {submitting ? "Joining…" : "Join the Waitlist"}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <p className="mt-1 text-center text-[11px] text-stone-400">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
