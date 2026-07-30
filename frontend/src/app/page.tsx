import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StockGrid } from "@/components/landing/StockGrid";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { FAQ } from "@/components/landing/FAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import "@/components/landing/landing.css";

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <main>
        <Hero />
        <MarketTicker />
        <Features />
        <HowItWorks />
        <StockGrid />
        <WaitlistSection />
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
