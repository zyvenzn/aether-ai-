"use client";

import React from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import GlowEffect from "@/components/shared/GlowEffect";
import { Zap, ShieldCheck, Cpu, Activity, Network, Layers } from "lucide-react";

const FEATURES = [
  {
    title: "Sub-Millisecond Neural Routing",
    description: "Dynamic edge dispatching layer that analyzes vector intent and routes requests to the nearest low-latency inference node globally.",
    icon: Zap,
    badge: "0.38ms p99",
    colSpan: "lg:col-span-2",
  },
  {
    title: "SOC2 & HIPAA Shield",
    description: "Zero data retention logging, vector payload sanitization, and end-to-end TLS 1.3 encryption out of the box.",
    icon: ShieldCheck,
    badge: "Enterprise Grade",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Autonomous Swarm Fleet",
    description: "Self-healing agent orchestration capable of spinning up and managing up to 10,000 parallel execution workers.",
    icon: Cpu,
    badge: "Auto-Scaling",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Real-time Telemetry & SSE Traces",
    description: "Stream token metrics, execution costs, trace waterfalls, and model performance logs directly into your unified dashboard.",
    icon: Activity,
    badge: "Live SSE Stream",
    colSpan: "lg:col-span-2",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative w-full bg-[#050505] py-24 sm:py-32 overflow-hidden border-t border-white/[0.08]">
      <GlowEffect position="center" />
      <Container>
        <SectionHeader
          badge="ARCHITECTURE OVERVIEW"
          icon={Layers}
          title="Engineered for extreme performance."
          description="A comprehensive infrastructure platform designed to replace fragmented AI toolchains with unified, high-speed execution."
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 relative z-10">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F0F0F] p-6 sm:p-8 transition-all duration-300 hover:border-[#7C3AED]/50 hover:shadow-[0_0_35px_rgba(124,58,237,0.18)] ${feature.colSpan}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#A855F7]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/50 group-hover:text-white transition-colors">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
