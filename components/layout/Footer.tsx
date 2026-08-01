"use client";

import React from "react";
import Container from "@/components/ui/Container";
import { Sparkles, Globe, MessageSquare, Code } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Neural Engine", href: "#features" },
      { label: "Agent Workflows", href: "#features" },
      { label: "Edge Router", href: "#showcase" },
      { label: "Telemetry", href: "#showcase" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Architecture Specs", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status Page", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "SOC2 Compliance", href: "#" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative w-full border-t border-white/[0.08] bg-[#050505] pt-16 pb-12 text-white">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6 pb-12 border-b border-white/[0.08]">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>AETHER<span className="text-[#A855F7]">.ai</span></span>
            </a>

            <p className="mt-4 max-w-xs text-xs text-white/50 leading-relaxed">
              Autonomous AI agent orchestration & sub-millisecond edge neural routing for modern engineering teams.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-mono text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {FOOTER_LINKS.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">{group.title}</h4>
              <ul className="space-y-2.5 text-xs text-white/50">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-white/40 sm:flex-row">
          <p>© 2026 AETHER AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a href="#" aria-label="Website" className="text-white/40 hover:text-white transition-colors">
              <Globe className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Code" className="text-white/40 hover:text-white transition-colors">
              <Code className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Community" className="text-white/40 hover:text-white transition-colors">
              <MessageSquare className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
