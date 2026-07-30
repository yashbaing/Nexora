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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Nexora — Trade Tokenized Stocks On-Chain | Join the Waitlist",
  description:
    "Nexora lets you trade tokenized global equities — Apple, Tesla, NVIDIA and more — as on-chain assets on Avalanche. Instant settlement, fractional shares, 24/7 markets. Join the waitlist for early access.",
  keywords: [
    "Nexora",
    "tokenized stocks",
    "tokenized equities",
    "Web3 trading",
    "Avalanche",
    "on-chain stocks",
    "crypto stock trading",
    "waitlist",
  ],
  openGraph: {
    title: "Nexora — Trade Tokenized Stocks On-Chain",
    description:
      "Instant settlement. Fractional shares. 24/7 markets. Trade tokenized global equities on Avalanche. Join the waitlist.",
    url: SITE_URL,
    siteName: "Nexora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora — Trade Tokenized Stocks On-Chain",
    description:
      "Instant settlement. Fractional shares. 24/7 markets. Join the waitlist for early access.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
