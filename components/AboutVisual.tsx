"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  FiAward,
  FiGlobe,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

type AboutVisualProps = {
  imageUrl?: string;
};

const highlights = [
  {
    icon: FiGlobe,
    label: "Global Client Reach",
    value: "50+ Countries",
  },
  {
    icon: FiTrendingUp,
    label: "Business Growth",
    value: "500+ Clients",
  },
  {
    icon: FiAward,
    label: "Professional Experience",
    value: "4+ Years",
  },
  {
    icon: FiTarget,
    label: "Primary Focus",
    value: "Sales Strategy",
  },
];

export default function AboutVisual({
  imageUrl = "/profile.webp",
}: AboutVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.96,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="premium-card relative overflow-hidden rounded-[34px] p-5"
      >
        <div className="relative min-h-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/20 via-slate-900/40 to-slate-950">
          <Image
            src={imageUrl}
            alt="Mobarok Hossain"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover object-[center_24%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.16),transparent_28%)]" />

          <div className="absolute bottom-5 left-5 right-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-2xl backdrop-blur-2xl">
              <p className="text-xl font-bold text-white">
                Mobarok Hossain.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Senior Sales Executive and International Client Communication
                Specialist.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {highlights.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.35,
              }}
              transition={{
                delay: index * 0.08,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="premium-card animated-card rounded-3xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {item.label}.
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {item.value}.
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}