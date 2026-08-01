"use client";

import React from "react";
import { motion } from "framer-motion";

export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Grid Pattern with Mask */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
        }}
      />

      {/* Primary Top Purple Glow */}
      <motion.div
        initial={{ opacity: 0.4, scale: 0.8 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute -top-[150px] left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-[#7C3AED]/30 to-[#A855F7]/20 blur-[120px]"
      />

      {/* Secondary Ambient Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 h-[250px] w-[800px] rounded-full bg-[#7C3AED]/10 blur-[140px]" />
    </div>
  );
};

export default HeroBackground;
