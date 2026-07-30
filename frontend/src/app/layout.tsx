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
  title: "Tokenssized — Trade Tokenized Stocks on Web3",
  description:
    "Join the waitlist for Tokenssized. Trade Apple, Tesla, NVIDIA and global equities on-chain with real-time data and instant settlement on Avalanche.",
  keywords: ["tokenized stocks", "web3 trading", "avalanche", "crypto equities", "waitlist"],
  openGraph: {
    title: "Tokenssized — Trade Tokenized Stocks on Web3",
    description: "The next generation of equity trading. Join the waitlist for early access.",
    type: "website",
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
