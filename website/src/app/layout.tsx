import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexora — Tokenized Equities on Avalanche",
  description:
    "Trade tokenized stocks settled in USDC on Avalanche. Real-time pricing from Hyperliquid, non-custodial wallet login, and on-chain settlement.",
  openGraph: {
    title: "Nexora — Tokenized Equities on Avalanche",
    description:
      "A premium Web3 equities platform with institutional liquidity and USDC settlement.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
