import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CollaborationPreview } from "@/components/home/CollaborationPreview";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-grow flex flex-col items-center w-full">
        <Hero />
        <CollaborationPreview />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
