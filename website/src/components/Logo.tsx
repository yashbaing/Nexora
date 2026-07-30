export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-semibold tracking-tight ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 via-indigo-500 to-cyan-400 text-[15px] font-bold text-[#05060a] shadow-[0_0_20px_rgba(139,92,246,0.45)]">
        N
      </span>
      <span className="text-lg text-white">Nexora</span>
    </span>
  );
}
