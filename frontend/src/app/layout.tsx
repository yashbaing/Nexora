import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ArcMOQ — UAE SMEs. Global inventory. One autonomous order.",
  description:
    "Group purchasing for UAE SMEs with an AI procurement agent, USDC→EURC settlement on Arc, and redeemable digital warehouse receipts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), sans-serif" }}>{children}</body>
    </html>
  );
}
