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
  title: "Nexora - Web3 Tokenized Stocks",
  description: "Trade tokenized equities on Avalanche C-Chain — Nexora, the premier Web3 equities platform.",
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
