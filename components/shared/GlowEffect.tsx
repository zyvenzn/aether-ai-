"use client";

import React from "react";

interface GlowEffectProps {
  position?: "top" | "center" | "bottom";
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  position = "center",
  className = "",
}) => {
  const positionClasses = {
    top: "-top-40 left-1/2 -translate-x-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "-bottom-40 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-[350px] w-[600px] rounded-full bg-gradient-to-tr from-[#7C3AED]/20 to-[#A855F7]/10 blur-[120px] ${positionClasses[position]} ${className}`}
    />
  );
};

export default GlowEffect;
