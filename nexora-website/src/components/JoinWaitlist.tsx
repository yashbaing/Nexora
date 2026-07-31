"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

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
        setMessage(data?.error || "Something went wrong.");
      } else {
        setMessage(data?.message || "You're on the waitlist!");
        setJoined(true);
      }
    } catch {
      setMessage("Something went wrong.");
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
        Join Waitlist
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            className="animate-modal-in relative w-full max-w-[260px] rounded-xl bg-white p-4 shadow-2xl shadow-black/25"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {joined ? (
              <div className="flex flex-col items-center py-1 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <p id="waitlist-title" className="mt-2.5 text-sm font-semibold text-stone-950">
                  You&apos;re in
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  We&apos;ll email you at launch.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-3 w-full rounded-lg bg-stone-950 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-2.5">
                <div className="pr-5">
                  <h3 id="waitlist-title" className="text-sm font-semibold text-stone-950">
                    Join waitlist
                  </h3>
                </div>

                <input
                  id="waitlist-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email"
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white"
                />

                {message && (
                  <p className="-mt-1 text-[11px] text-red-600">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-stone-950 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                >
                  {submitting ? "…" : "Join"}
                  {!submitting && <ArrowRight className="h-3 w-3" />}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
