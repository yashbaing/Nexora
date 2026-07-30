"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { fetchWaitlistStats } from "@/lib/api";

export default function LiveWaitlistCount({ className = "" }: { className?: string }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchWaitlistStats()
      .then((res) => {
        if (mounted) setTotal(res.total);
      })
      .catch(() => {
        if (mounted) setTotal(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70 ${className}`}
    >
      <Users size={14} className="text-cyan-300" />
      {total !== null ? (
        <span className="font-mono-num tick-fade" key={total}>
          <span className="font-semibold text-white">{total.toLocaleString()}</span> builders &amp;
          traders already on the list
        </span>
      ) : (
        <span>Be among the first to get early access</span>
      )}
    </div>
  );
}
