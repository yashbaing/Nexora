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
  title: "Nexora — Wall Street, Tokenized",
  description:
    "Trade tokenized stocks like AAPL, NVDA and TSLA 24/7 on Avalanche. Settled in USDC in under 2 seconds, fully non-custodial. Join the waitlist for early access.",
  openGraph: {
    title: "Nexora — Wall Street, Tokenized",
    description:
      "Trade tokenized stocks 24/7 on Avalanche. Settled in USDC in under 2 seconds, fully non-custodial. Join the waitlist for early access.",
    siteName: "Nexora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora — Wall Street, Tokenized",
    description:
      "Trade tokenized stocks 24/7 on Avalanche. Settled in USDC in under 2 seconds, fully non-custodial.",
  },
};

import { WalletProvider } from "@/context/WalletContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
