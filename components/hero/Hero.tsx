"use client";

import React from "react";
import HeroContent from "./HeroContent";
import HeroDashboard from "./HeroDashboard";
import Container from "@/components/ui/Container";
import GlowEffect from "@/components/shared/GlowEffect";

export const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050505] pt-28 pb-20">
      <GlowEffect position="top" />
      <Container className="relative z-10 flex flex-col items-center text-center">
        <HeroContent />
        <HeroDashboard />
      </Container>
    </section>
  );
};

export default Hero;
