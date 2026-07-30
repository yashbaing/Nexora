import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TickerTape from "@/components/TickerTape";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import Assets from "@/components/Assets";
import HowItWorks from "@/components/HowItWorks";
import WaitlistCTA from "@/components/WaitlistCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#05060a]">
      <Nav />
      <Hero />
      <TickerTape />
      <div className="h-16 sm:h-24" />
      <Stats />
      <Features />
      <Assets />
      <HowItWorks />
      <WaitlistCTA />
      <FAQ />
      <Footer />
    </main>
  );
}
