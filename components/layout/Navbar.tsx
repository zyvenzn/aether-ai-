"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
      <Container className="max-w-6xl">
        <nav className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-3 px-6 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>AETHER<span className="text-[#A855F7]">.ai</span></span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#showcase" className="hover:text-white transition-colors">Workflows</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#pricing" className="text-xs font-medium text-white/80 hover:text-white">
              Sign In
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:bg-[#6D28D9]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/70 hover:text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/95 p-6 backdrop-blur-xl md:hidden space-y-4">
            <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Features</a>
            <a href="#showcase" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Workflows</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">Pricing</a>
            <a href="#faq" onClick={() => setIsOpen(false)} className="block text-sm text-white/80">FAQ</a>
            <hr className="border-white/[0.08]" />
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-3 text-sm font-semibold text-white"
            >
              Get Started
            </a>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Navbar;
