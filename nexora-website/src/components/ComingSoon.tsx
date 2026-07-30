type Variant = "hero" | "cta";

export default function ComingSoon({ variant = "hero" }: { variant?: Variant }) {
  if (variant === "cta") {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-8 py-4 text-sm font-semibold text-stone-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-orange-400" />
        </span>
        App launching soon
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-orange-400" />
      </span>
      App launching soon
    </div>
  );
}
