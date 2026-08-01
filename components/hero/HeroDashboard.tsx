"use client";

import React from "react";
import { Terminal, Shield, Zap, Cpu } from "lucide-react";

export const HeroDashboard = () => {
  return (
    <div className="relative mt-12 w-full max-w-5xl rounded-2xl border border-white/[0.1] bg-[#0A0A0A] p-3 sm:p-4 shadow-[0_0_50px_rgba(124,58,237,0.15)] overflow-hidden">
      {/* Top Mac Window Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 font-mono text-xs text-white/40 hidden sm:inline">
            ~/aether/orchestrator/main.rs
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
          <span>p99: 0.38ms</span>
        </div>
      </div>

      {/* Code / Analytics Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Terminal Code Panel */}
        <div className="lg:col-span-2 rounded-xl bg-black/60 p-4 font-mono text-xs text-white/80 border border-white/[0.04]">
          <p className="text-white/40">// Initializing Multi-Region Autonomous Agent Fleet</p>
          <p className="mt-2 text-[#A855F7]">$ aether cluster deploy --region=global --zero-latency</p>
          <p className="mt-1 text-emerald-400">[OK] 12,000 Neural Edge Nodes synchronized in 14ms.</p>
          <p className="mt-1 text-white/60">[SYS] Evaluating vector routing payload... Done.</p>
          <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/90">
            <span className="text-purple-400">agent_09</span>: {"{"} status: "optimal", auto_correct: true, overhead: "0.2ms" {"}"}
          </div>
        </div>

        {/* Realtime Stats Column */}
        <div className="flex flex-col justify-between gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Cluster Health</span>
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">99.999%</p>
            <p className="text-[10px] text-emerald-400 mt-1">SOC2 Type II Protected</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Neural Throughput</span>
              <Zap className="h-4 w-4 text-[#A855F7]" />
            </div>
            <p className="text-2xl font-bold text-white">4.2M req/s</p>
            <p className="text-[10px] text-[#A855F7] mt-1">+34% vs Traditional LLM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
