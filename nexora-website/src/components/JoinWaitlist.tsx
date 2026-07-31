"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Mail, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

type Variant = "nav" | "cta" | "hero";

export default function JoinWaitlist({ variant = "nav" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const close = () => setOpen(false);

  const openModal = () => {
    setJoined(false);
    setMessage("");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Please try again.");
      } else {
        setMessage(data?.message || "You're on the waitlist!");
        setJoined(true);
      }
    } catch {
      setMessage("Please try again.");
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={close}
        >
          <div className="absolute inset-0 bg-[#07090d]/55 backdrop-blur-sm" />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="animate-modal-in relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_-16px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thin brand accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#f0a35e] via-[#f0a35e] to-emerald-400" />

            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-5 pb-5 pt-4">
              {joined ? (
                <div className="text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 id={titleId} className="mt-3 font-serif text-xl text-stone-950">
                    You&apos;re on the list
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                    We&apos;ll email you when Nexora launches.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 w-full rounded-xl bg-stone-950 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="pr-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-400">
                      Nexora
                    </p>
                    <h3 id={titleId} className="mt-1 font-serif text-xl text-stone-950">
                      Join the waitlist
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                      Get notified when the app is ready.
                    </p>
                  </div>

                  <form onSubmit={submit} className="mt-4 space-y-3">
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        ref={inputRef}
                        id="waitlist-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3.5 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-[#f0a35e] focus:bg-white focus:ring-4 focus:ring-[#f0a35e]/15"
                      />
                    </div>

                    {message && (
                      <p className="text-xs text-rose-600" role="alert">
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090d] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1f28] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Joining…
                        </>
                      ) : (
                        <>
                          Join waitlist
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
