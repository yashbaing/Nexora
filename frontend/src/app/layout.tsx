import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-nx-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-nx-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nexora — Tokenized Stocks on Avalanche",
  description:
    "Own real stocks. Trade them as tokens. Avalanche-native equities settled in USDC with Hyperliquid liquidity. Join the waitlist.",
  openGraph: {
    title: "Nexora — Tokenized Stocks on Avalanche",
    description:
      "Own real stocks. Trade them as tokens. Join the waitlist for early access.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
