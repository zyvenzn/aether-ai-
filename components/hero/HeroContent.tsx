"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Command } from "lucide-react";

export const HeroContent = () => {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md hover:border-[#7C3AED]/40 transition-colors cursor-pointer"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
        <span>Introducing AETHER Neural Engine 3.0</span>
        <span className="ml-1 text-white/40">|</span>
        <span className="text-[#A855F7] hover:underline flex items-center gap-0.5">
          Read docs <ArrowRight className="h-3 w-3 inline" />
        </span>
      </motion.div>

      {/* Main Editorial Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-7xl leading-[1.08]"
      >
        Intelligence designed for <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-white via-white/90 to-[#A855F7] bg-clip-text text-transparent">
          modern engineering teams.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed font-normal"
      >
        Automate workflows, analyze real-time telemetry, and deploy autonomous AI agents with zero latency. Built for teams who refuse to compromise on quality.
      </motion.p>

      {/* Action CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
      >
        <Link
          href="/chat"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] active:scale-[0.98]"
        >
          <span>Start Chatting</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white/90 transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] backdrop-blur-md"
        >
          <Command className="h-4 w-4 text-white/50" />
          <span>Quick Demo</span>
          <kbd className="ml-1 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">⌘K</kbd>
        </button>
      </motion.div>
    </div>
  );
};

export default HeroContent;
