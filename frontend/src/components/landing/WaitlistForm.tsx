"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type WaitlistFormProps = {
  variant?: "hero" | "footer";
  source?: string;
};

export default function WaitlistForm({ variant = "hero", source = "landing" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus(data.alreadyJoined ? "exists" : "success");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const isDone = status === "success" || status === "exists";
  const isHero = variant === "hero";

  if (isDone) {
    return (
      <div className={`nx-waitlist-done ${isHero ? "nx-waitlist-done--hero" : ""}`} role="status">
        <span className="nx-waitlist-done__icon">
          <Check size={18} strokeWidth={2.5} />
        </span>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className={`nx-waitlist ${isHero ? "nx-waitlist--hero" : "nx-waitlist--footer"}`} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={`waitlist-email-${variant}`}>
        Email address
      </label>
      <input
        id={`waitlist-email-${variant}`}
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        disabled={status === "loading"}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="nx-spin" />
            Joining
          </>
        ) : (
          <>
            Join waitlist
            <ArrowRight size={16} />
          </>
        )}
      </button>
      {status === "error" && <p className="nx-waitlist__error">{message}</p>}
    </form>
  );
}
