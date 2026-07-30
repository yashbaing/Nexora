import { site } from "@/lib/site";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-[10px] border border-white/10 bg-gradient-to-b from-white/12 to-white/2 ${className}`}
    >
      <svg viewBox="0 0 32 32" aria-hidden className="h-[62%] w-[62%]">
        <defs>
          <linearGradient id="nexora-mark" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#12a877" />
            <stop offset="55%" stopColor="#34e5a0" />
            <stop offset="100%" stopColor="#c9fde6" />
          </linearGradient>
        </defs>
        <path
          d="M5 27V5l22 22V5"
          fill="none"
          stroke="url(#nexora-mark)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="display text-[22px] leading-none text-chalk">{site.wordmark}</span>
    </span>
  );
}
