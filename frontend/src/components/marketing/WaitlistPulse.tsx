"use client";

import { useEffect, useState } from "react";

const SEATS = ["#34e5a0", "#7a6bff", "#ff6a3d", "#f6f6f4", "#12a877"];

/**
 * Social proof for the hero. Renders a neutral "early access is open" line until
 * the real signup count is known, so the page never advertises a number it made up.
 */
export function WaitlistPulse({ className = "" }: { className?: string }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/waitlist/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { total?: number };
        if (!cancelled && typeof data.total === "number") setTotal(data.total);
      } catch {
        /* leave the fallback copy in place */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex -space-x-2.5">
        {SEATS.map((color, i) => (
          <span
            key={color}
            className="h-7 w-7 rounded-full border-2 border-void"
            style={{
              background: `linear-gradient(140deg, ${color}, rgba(6,6,10,0.85))`,
              zIndex: SEATS.length - i,
            }}
          />
        ))}
      </div>
      <p className="text-[13px] text-ash">
        {total && total > 0 ? (
          <>
            <span className="tabular font-semibold text-chalk">{total.toLocaleString()}</span>{" "}
            {total === 1 ? "person has" : "people have"} claimed a place
          </>
        ) : (
          <>Early access is open — places are allocated in order</>
        )}
      </p>
    </div>
  );
}
