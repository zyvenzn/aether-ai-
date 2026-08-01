"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import GlowEffect from "@/components/shared/GlowEffect";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    description: "Ideal for individual developers and rapid prototyping.",
    priceMonthly: 29,
    priceYearly: 24,
    features: [
      "Up to 100,000 requests/mo",
      "2 Autonomous Agents",
      "Standard Latency Routing",
      "Community Support",
      "7-day Telemetry Retention",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    description: "For scaling engineering teams and production AI workloads.",
    priceMonthly: 99,
    priceYearly: 79,
    features: [
      "Up to 2,500,000 requests/mo",
      "25 Autonomous Agents",
      "Sub-0.5ms Edge Routing",
      "Dedicated Slack Channel",
      "90-day Telemetry Retention",
      "SOC2 & HIPAA Mode",
      "Custom Fine-tuned Pipelines",
    ],
    cta: "Get Started Now",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom infrastructure and dedicated high-throughput clusters.",
    priceMonthly: 399,
    priceYearly: 329,
    features: [
      "Unlimited Requests & Agents",
      "Dedicated Private Edge Nodes",
      "24/7 SLA & Dedicated Engineer",
      "Custom Log Retention",
      "Custom SSO & SAML Auth",
      "VPC & On-Premises Deploy",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="relative w-full bg-[#050505] py-24 sm:py-32 border-t border-white/[0.08] overflow-hidden">
      <GlowEffect position="center" />
      <Container>
        <SectionHeader
          badge="TRANSPARENT PRICING"
          title="Predictable cost, zero surprises."
          description="Scale seamlessly from side project to global enterprise with flat-rate infrastructure plans."
        />

        {/* Toggle Billing */}
        <div className="flex items-center justify-center mb-12 relative z-10">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F0F0F] p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                !isYearly ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                isYearly ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]" : "text-white/50 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 items-stretch relative z-10">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-[#7C3AED] bg-[#0F0F0F] shadow-[0_0_40px_rgba(124,58,237,0.2)]"
                    : "border border-white/[0.08] bg-[#0F0F0F] hover:border-white/[0.2]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#7C3AED] px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-xs text-white/60 min-h-[32px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white">${price}</span>
                    <span className="text-xs text-white/40">/month</span>
                  </div>

                  <hr className="my-6 border-white/[0.08]" />

                  <ul className="space-y-3 text-xs text-white/70">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#A855F7] mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                      : "border border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default PricingSection;
