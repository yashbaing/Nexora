"use client";

import { WalletProvider } from "@/context/WalletContext";
import Script from "next/script";

export default function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      <WalletProvider>{children}</WalletProvider>
    </>
  );
}
