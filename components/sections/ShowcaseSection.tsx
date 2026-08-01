"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import GlowEffect from "@/components/shared/GlowEffect";
import { Terminal, Cpu, Network, CheckCircle2, Copy } from "lucide-react";

const TABS = [
  {
    id: "routing",
    label: "Neural Routing",
    icon: Network,
    badge: "0.38ms Overhead",
    code: `// Multi-Region Edge Neural Router
import { createEngine } from "@aether/core";

export const router = createEngine({
  strategy: "latency-optimal",
  fallback: "eu-central-1",
  security: { zeroTrust: true, sanitizeVectors: true }
});

await router.dispatch({ task: "inference", payload: data });`,
  },
  {
    id: "telemetry",
    label: "Agent Telemetry",
    icon: Terminal,
    badge: "Real-time SSE",
    code: `// Real-Time Telemetry Stream
const stream = await aether.telemetry.subscribe({
  metrics: ["tokens_sec", "cost_per_req", "p99_latency"],
  interval: "10ms"
});

stream.on("event", (trace) => console.log(trace));`,
  },
  {
    id: "clusters",
    label: "Autonomous Clusters",
    icon: Cpu,
    badge: "Auto-Healing",
    code: `// Self-Healing Swarm Policy
export default defineClusterPolicy({
  autoScale: { maxPods: 256, targetCPU: 0.75 },
  healthCheck: { interval: "500ms", retryCount: 3 },
  failoverRegion: "us-east-1"
});`,
  },
];

export const ShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section id="showcase" className="relative w-full bg-[#050505] py-24 sm:py-32 border-t border-white/[0.08] overflow-hidden">
      <GlowEffect position="center" />
      <Container>
        <SectionHeader
          badge="WORKFLOW & TELEMETRY"
          icon={Terminal}
          title="Control center for your AI stack."
          description="Precision instrumentation, granular trace logs, and automated scaling—all built into a unified dark workspace."
        />

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 relative z-10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    : "border border-white/[0.08] bg-[#0F0F0F] text-white/60 hover:text-white hover:border-white/[0.2]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Window */}
        <div className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/[0.1] bg-[#0F0F0F] p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-white/40">
                ~/aether/config/{activeTab}.config.ts
              </span>
            </div>
            <span className="rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#A855F7]">
              {currentTab.badge}
            </span>
          </div>

          <div className="rounded-xl bg-black/80 p-4 sm:p-6 font-mono text-xs text-emerald-400 overflow-x-auto min-h-[180px]">
            <pre className="leading-relaxed">
              <code>{currentTab.code}</code>
            </pre>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Pipeline active & synchronized</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span>Avg Overhead: <strong className="text-white">0.38ms</strong></span>
              <span>Cluster Memory: <strong className="text-white">1.8 GB</strong></span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ShowcaseSection;
