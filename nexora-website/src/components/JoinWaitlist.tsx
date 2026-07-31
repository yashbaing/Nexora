"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

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
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
          <button
            type="button"
            aria-label="Close waitlist"
            className="fixed inset-0 bg-[#07090d]/60 backdrop-blur-md"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="waitlist-glass animate-modal-in relative my-auto w-full max-w-[340px] rounded-3xl p-6"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {joined ? (
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/25">
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <h3 id={titleId} className="mt-3 text-xl font-semibold text-white">
                  You&apos;re on the waitlist
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  We&apos;ll email you when the app is ready.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-full bg-[#c47a3a] py-3 text-sm font-semibold text-white transition hover:bg-[#d08948]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="pr-6 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-medium text-white/70">Waitlist</span>
                  </div>
                  <h3 id={titleId} className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Join our waitlist
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                    Get notified when the app launches.
                  </p>
                </div>

                <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                  <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id="waitlist-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/10"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#c47a3a] py-3 text-sm font-semibold text-white transition hover:bg-[#d08948] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Join Waitlist"
                    )}
                  </button>

                  {message && (
                    <p className="text-center text-xs text-rose-300" role="alert">
                      {message}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
