"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import GlowEffect from "@/components/shared/GlowEffect";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "How does AETHER integrate with our existing Next.js / Node.js codebase?",
    answer:
      "AETHER provides lightweight SDKs for TypeScript, Python, and Go. You can install `@aether/core` and initialize the router in less than 5 minutes. Works seamlessly with Vercel, AWS Lambda, or Docker containers.",
  },
  {
    question: "What is the average overhead added by the Neural Routing layer?",
    answer:
      "Our edge routing nodes process request meta-data with less than 0.38ms average overhead globally, utilizing direct Cloudflare and AWS CloudFront edge workers.",
  },
  {
    question: "Is AETHER SOC2 Type II and HIPAA compliant out of the box?",
    answer:
      "Yes. All enterprise and pro plan traffic is encrypted at rest (AES-256) and in transit (TLS 1.3). We do not retain customer vector or prompt payload logs unless explicitly enabled.",
  },
  {
    question: "Can we run self-hosted or VPC deployments?",
    answer:
      "Enterprise customers can deploy dedicated AETHER cluster control planes directly inside their AWS, GCP, or Azure VPC infrastructure.",
  },
  {
    question: "How does billing work if our API usage spikes unexpectedly?",
    answer:
      "We provide configurable spending caps and automatic rate-limiting rules to prevent unexpected bill shock. You will receive real-time Slack/Webhook alerts at 80% usage thresholds.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative w-full bg-[#050505] py-24 sm:py-32 border-t border-white/[0.08] overflow-hidden">
      <GlowEffect position="center" />
      <Container>
        <SectionHeader
          badge="FREQUENTLY ASKED QUESTIONS"
          icon={HelpCircle}
          title="Everything you need to know."
          description="Have questions about integration, security, or custom architecture? We have answers."
        />

        <div className="mx-auto max-w-3xl space-y-3.5 relative z-10">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F0F0F] transition-all hover:border-white/[0.15]"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-white transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.06] p-5 pt-3 text-xs leading-relaxed text-white/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;
