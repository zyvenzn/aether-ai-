import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { Hero } from "@/components/hero";
import TrustedBySection from "@/components/sections/TrustedBySection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import ShowcaseSection from "@/components/sections/ShowcaseSection";
import PricingSection from "@/components/sections/PricingSection";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#7C3AED] selection:text-white antialiased">
      <Navbar />
      <Hero />
      <TrustedBySection />
      <FeaturesSection />
      <ShowcaseSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
