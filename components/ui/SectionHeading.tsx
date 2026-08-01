"use client";

import { motion } from "framer-motion";

type Props = {
  badge: string;
  title: string;
  highlight?: string;
  description: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  badge,
  title,
  highlight,
  description,
  align = "left",
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration: 0.7,
      }}
      className={`max-w-3xl ${
        align === "center"
          ? "mx-auto text-center"
          : ""
      }`}
    >
      <div className="section-label mb-6 inline-flex">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
        </span>

        {badge}
      </div>

      <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white md:text-6xl">
        {title}{" "}

        {highlight && (
          <span className="text-gradient">
            {highlight}
          </span>
        )}
      </h2>

      <p className="mt-7 text-lg leading-8 text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}