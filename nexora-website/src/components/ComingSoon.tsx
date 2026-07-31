type Variant = "hero" | "cta";

export default function ComingSoon({ variant = "hero" }: { variant?: Variant }) {
  if (variant === "cta") {
    return (
      <div className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-stone-300 bg-white px-6 py-4 text-sm font-semibold text-stone-400 sm:w-auto sm:px-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#f0a35e]" />
        </span>
        App launching soon
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white/55">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#f0a35e]" />
      </span>
      App launching soon
    </div>
  );
}
