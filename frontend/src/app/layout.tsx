import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcMOQ — Small buyers. Real inventory. One autonomous global order.",
  description:
    "UAE SMEs pool demand, an AI agent negotiates supplier MOQs, settles USDC→EURC on Arc, and mints redeemable warehouse receipts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
