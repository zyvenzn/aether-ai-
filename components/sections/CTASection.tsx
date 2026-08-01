"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import GlowEffect from "@/components/shared/GlowEffect";
import Badge from "@/components/shared/Badge";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="relative w-full bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-white/[0.08]">
      <GlowEffect position="center" className="opacity-60" />

      <Container>
        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0A0A0A] p-8 sm:p-16 text-center shadow-[0_0_50px_rgba(124,58,237,0.1)]">
          {/* Background Micro Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <Badge pulse variant="primary" className="mb-6">
              READY FOR PRODUCTION
            </Badge>

            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Scale your AI infrastructure with <span className="text-[#A855F7]">zero compromises</span>.
            </h2>

            <p className="mt-4 max-w-xl text-base text-white/60">
              Join thousands of forward-thinking engineering teams deploying autonomous agents on AETHER today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all hover:bg-[#6D28D9] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)]"
              >
                <span>Get Started For Free</span>
                <ArrowRight className="h-4 w-4" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Terminal className="h-4 w-4 text-white/60" />
                <span>Read Architecture Docs</span>
              </motion.a>
            </div>

            <p className="mt-6 text-xs text-white/40 font-mono">
              14-day free trial • No credit card required • SOC2 Type II Certified
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
