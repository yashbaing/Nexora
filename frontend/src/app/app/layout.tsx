"use client";

import { SiteHeader } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-4">{children}</div>
    </div>
  );
}
