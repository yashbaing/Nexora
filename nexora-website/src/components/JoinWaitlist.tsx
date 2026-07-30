"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

type Variant = "nav" | "cta";

export default function JoinWaitlist({ variant = "nav" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
        body: JSON.stringify({ email, name: name || undefined }),
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
      : "inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-10 py-4 text-sm font-semibold text-stone-950 transition hover:border-stone-300 hover:bg-stone-50";

  return (
    <>
      <button type="button" onClick={openModal} className={buttonClass}>
        <Sparkles className="h-4 w-4 text-orange-600" />
        Join Waitlist
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/40 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-2xl shadow-stone-950/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-950"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {joined ? (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl tracking-tight text-stone-950">
                  You&apos;re on the list
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  {message || "We'll email you when it's your turn."}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-6 w-full rounded-xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-950">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-serif text-2xl tracking-tight text-stone-950">
                  Join the Waitlist
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  Be first to know when Nexora opens up.
                </p>

                <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                  />
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                  />

                  {message && (
                    <p className="text-left text-xs text-red-600">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                  >
                    {submitting ? "Joining..." : "Join Waitlist"}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
