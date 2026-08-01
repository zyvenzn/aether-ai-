"use client";

import React from "react";
import { motion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  pulse?: boolean;
  variant?: "primary" | "accent" | "outline";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  pulse = false,
  variant = "primary",
  className = "",
}) => {
  const variantStyles = {
    primary: "border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#A855F7]",
    accent: "border-white/10 bg-white/[0.04] text-white/80",
    outline: "border-white/[0.08] bg-transparent text-white/60",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A855F7] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C3AED]" />
        </span>
      )}
      {children}
    </motion.div>
  );
};

export default Badge;
