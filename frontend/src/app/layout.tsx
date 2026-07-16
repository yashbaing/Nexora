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
  title: "Stockwave - Web3 Tokenized Stocks",
  description: "Trade tokenized equities on Avalanche C-Chain",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
