import { Geist, Geist_Mono } from "next/font/google";
import WalletProviders from "./WalletProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <div className={`app-route ${geistSans.variable} ${geistMono.variable}`}>{children}</div>
    </WalletProviders>
  );
}
