"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";

const LOGOS = [
  { name: "Linear", path: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12z" },
  { name: "Vercel", path: "M12 1L24 22H0L12 1Z" },
  { name: "Raycast", path: "M12 2L2 12l10 10 10-10L12 2zm0 4.5l5.5 5.5-5.5 5.5-5.5-5.5L12 6.5z" },
  { name: "OpenAI", path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" },
  { name: "Supabase", path: "M13.376 11.552l-8.082 9.2a.5.5 0 0 1-.84-.483l2.842-8.218H2.5a.5.5 0 0 1-.383-.82l8.082-9.2a.5.5 0 0 1 .84.483l-2.842 8.218h4.796a.5.5 0 0 1 .383.82z" },
  { name: "Stripe", path: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-3.922C17.752 2.372 15.111 2 12.511 2 7.732 2 4.3 4.382 4.3 8.3c0 4.887 6.442 5.258 6.442 7.91 0 .979-.838 1.488-2.172 1.488-2.316 0-5.18-1.042-7.05-2.022l-.934 3.991C2.502 20.61 5.485 21 8.358 21c5.205 0 8.8-2.274 8.8-6.49 0-5.064-6.442-5.498-6.442-7.91 0-.953.78-1.36 2.016-1.36 1.776 0 3.828.614 5.244 1.288l.842-3.878z" },
];

export const TrustedBySection = () => {
  return (
    <section className="relative w-full border-y border-white/[0.08] bg-[#050505] py-12 overflow-hidden">
      <Container>
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-xs font-mono tracking-widest text-white/40 uppercase mb-8">
            POWERING INFRASTRUCTURE FOR INNOVATORS WORLDWIDE
          </p>

          <div
            className="relative w-full overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 25,
                ease: "linear",
                repeat: Infinity,
              }}
              className="flex w-max items-center gap-16"
            >
              {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="flex items-center gap-2.5 text-white/40 hover:text-white transition-colors duration-300 group cursor-pointer"
                >
                  <svg
                    className="h-6 w-6 fill-current text-white/40 group-hover:text-[#A855F7] transition-colors duration-300"
                    viewBox="0 0 24 24"
                  >
                    <path d={logo.path} />
                  </svg>
                  <span className="text-sm font-semibold tracking-tight text-white/50 group-hover:text-white transition-colors">
                    {logo.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TrustedBySection;
