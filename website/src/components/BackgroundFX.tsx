export default function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div
        className="blob-1 absolute -top-40 left-[8%] h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />
      <div
        className="blob-2 absolute top-[20%] right-[2%] h-[460px] w-[460px] rounded-full opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
      />
      <div
        className="blob-3 absolute bottom-[-10%] left-[30%] h-[500px] w-[500px] rounded-full opacity-25 blur-[130px]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 60%, #05060a 100%)",
        }}
      />
    </div>
  );
}
