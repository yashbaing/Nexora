"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  PartyPopper,
  Share2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { site } from "@/lib/site";

const STORAGE_KEY = "nexora.waitlist.v1";

export type WaitlistStatus = {
  email: string;
  referralCode: string;
  rank: number;
  referrals: number;
  boost: number;
  boostPerReferral: number;
  position: number;
  total: number;
  alreadyJoined?: boolean;
};

type Props = {
  /** `hero` is the compact inline row; `panel` is the large standalone block. */
  variant?: "hero" | "panel";
  source?: string;
};

const readStored = (): WaitlistStatus | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WaitlistStatus;
    return typeof parsed?.referralCode === "string" ? parsed : null;
  } catch {
    return null;
  }
};

export function WaitlistForm({ variant = "hero", source = "landing" }: Props) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WaitlistStatus | null>(null);
  const refCode = useRef<string | null>(null);

  // Restore a previous signup and refresh its position, and pick up ?ref= codes.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get("ref");
    if (incoming) refCode.current = incoming.trim().toUpperCase();

    let cancelled = false;

    const restore = async () => {
      const stored = readStored();
      if (!stored || cancelled) return;
      setStatus(stored);

      try {
        const res = await fetch(`/api/waitlist/me?code=${encodeURIComponent(stored.referralCode)}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const fresh = (await res.json()) as WaitlistStatus;
        // The lookup masks the address; keep the one the visitor actually typed.
        const merged = { ...fresh, email: stored.email, alreadyJoined: true };
        if (cancelled) return;
        setStatus(merged);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        /* offline or backend down — the stored status is good enough */
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const value = email.trim();
      if (!value) {
        setError("Enter your email to reserve a place.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value)) {
        setError("That email doesn't look right — mind checking it?");
        return;
      }

      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value, ref: refCode.current, source }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(
            (data && typeof data.error === "string" && data.error) ||
              "We couldn't reach the waitlist just now. Please try again in a moment.",
          );
          return;
        }

        const next = data as WaitlistStatus;
        setStatus(next);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        setError("Network error — check your connection and try again.");
      } finally {
        setPending(false);
      }
    },
    [email, source],
  );

  if (status) {
    return (
      <JoinedCard
        status={status}
        variant={variant}
        onReset={() => {
          window.localStorage.removeItem(STORAGE_KEY);
          setStatus(null);
          setEmail("");
        }}
      />
    );
  }

  return (
    <div className={variant === "panel" ? "w-full max-w-xl" : "w-full max-w-lg"}>
      {/* noValidate: we surface our own inline messages rather than the browser's
          native tooltip, which ignores the site's styling. */}
      <form noValidate onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="you@email.com"
            aria-label="Email address"
            aria-invalid={Boolean(error)}
            className="h-[52px] w-full rounded-full border border-white/12 bg-white/4 px-5 text-[15px] text-chalk placeholder:text-smoke transition-colors outline-none focus:border-mint/60 focus:bg-white/7"
          />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary h-[52px] px-7">
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Reserving
            </>
          ) : (
            <>
              Get early access
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {error ? (
        <p className="mt-3 flex items-start gap-2 text-[13px] text-crimson">
          <TriangleAlert size={14} className="mt-px shrink-0" />
          {error}
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-[12.5px] text-smoke">
          <Sparkles size={13} className="shrink-0 text-mint/70" />
          One email. No wallet, no card, no spam — leave whenever you like.
        </p>
      )}
    </div>
  );
}

// ── Joined state ──────────────────────────────────────────────────────────────

function JoinedCard({
  status,
  variant,
  onReset,
}: {
  status: WaitlistStatus;
  variant: "hero" | "panel";
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(site.url);

  // Share the domain the visitor is actually on, so referral links work on
  // preview deployments and before a custom domain is configured.
  useEffect(() => {
    const timer = setTimeout(() => setOrigin(window.location.origin), 0);
    return () => clearTimeout(timer);
  }, []);

  const link = `${origin}/?ref=${status.referralCode}`;
  const shareText = `I just claimed my spot on the ${site.name} waitlist — fractional tokenized stocks, settled on-chain in USDC. Jump the queue with my link:`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shares = [
    {
      label: "Share on X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`,
    },
  ];

  return (
    <div
      className={`ring-gradient relative overflow-hidden rounded-3xl bg-panel/80 p-6 backdrop-blur-xl sm:p-8 ${
        variant === "panel" ? "w-full max-w-xl" : "w-full max-w-lg"
      }`}
    >
      <div className="orb -top-24 -right-16 h-56 w-56 bg-mint/18" />

      <div className="relative">
        <div className="flex items-center gap-2 text-mint">
          <PartyPopper size={16} />
          <span className="eyebrow !text-mint">
            {status.alreadyJoined ? "You're already in" : "You're in"}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="display text-6xl text-gradient-mint tabular sm:text-7xl">
            #{status.position.toLocaleString()}
          </span>
          <span className="pb-2 text-[13px] text-ash">
            in line
            {status.total > 0 && (
              <>
                {" "}
                of {status.total.toLocaleString()}
              </>
            )}
          </span>
        </div>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ash">
          We&apos;ll email <span className="text-chalk">{status.email}</span> the moment your
          invite is ready. Want in sooner? Every friend who joins with your link moves you{" "}
          <span className="text-chalk">{status.boostPerReferral} places</span> up the queue.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-void/60 p-1.5">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate px-3 py-2 font-mono text-[13px] text-ash">{link}</code>
            <button
              type="button"
              onClick={copy}
              className="btn btn-primary !px-4 !py-2.5 !text-[13px]"
              aria-label="Copy your referral link"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-[12.5px] text-smoke">
            <Share2 size={13} /> Share
          </span>
          {shares.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-white/12 bg-white/4 px-3.5 py-1.5 text-[12.5px] text-ash transition-colors hover:border-mint/40 hover:text-chalk"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5 text-[12.5px]">
          <span className="text-smoke">
            {status.referrals > 0 ? (
              <>
                <span className="text-mint">{status.referrals}</span> referral
                {status.referrals === 1 ? "" : "s"} · {status.boost} places gained
              </>
            ) : (
              <>Queue position #{status.rank.toLocaleString()} before referrals</>
            )}
          </span>
          <button type="button" onClick={onReset} className="text-smoke underline-offset-4 transition-colors hover:text-ash hover:underline">
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}
