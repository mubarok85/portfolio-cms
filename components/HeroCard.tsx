"use client";

import Image from "next/image";
import { MouseEvent, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiBarChart2,
  FiGlobe,
  FiMessageCircle,
  FiTrendingUp,
} from "react-icons/fi";

type HeroCardProps = {
  imageUrl?: string | null;
  countriesReached?: number;
  isAvailable?: boolean;
};

const orbitItems = [
  {
    icon: FiTrendingUp,
    label: "Sales Growth",
    className: "hero-orbit-item hero-orbit-item-one",
  },
  {
    icon: FiMessageCircle,
    label: "Client Communication",
    className: "hero-orbit-item hero-orbit-item-two",
  },
  {
    icon: FiGlobe,
    label: "Global Reach",
    className: "hero-orbit-item hero-orbit-item-three",
  },
  {
    icon: FiBarChart2,
    label: "Business Strategy",
    className: "hero-orbit-item hero-orbit-item-four",
  },
];

export default function HeroCard({
  imageUrl = "/profile.webp",
  countriesReached = 50,
  isAvailable = true,
}: HeroCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 120,
    damping: 20,
    mass: 0.3,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 120,
    damping: 20,
    mass: 0.3,
  });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);

  const outerRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-14, 14],
  );

  const outerRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-14, 14],
  );

  const middleRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [12, -12],
  );

  const middleRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [12, -12],
  );

  const leftCardX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-10, 10],
  );

  const leftCardY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-7, 7],
  );

  const rightCardX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [9, -9],
  );

  const rightCardY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [8, -8],
  );

  const badgeX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [7, -7],
  );

  const badgeY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-6, 6],
  );

  function handleMouseMove(
    event: MouseEvent<HTMLDivElement>,
  ) {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const rectangle = element.getBoundingClientRect();

    const x =
      (event.clientX - rectangle.left) /
        rectangle.width -
      0.5;

    const y =
      (event.clientY - rectangle.top) /
        rectangle.height -
      0.5;

    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[590px] items-center justify-center"
    >
      <motion.div
        style={{
          x: outerRingX,
          y: outerRingY,
        }}
        className="pointer-events-none absolute h-[520px] w-[520px] max-w-[94vw] rounded-full border border-blue-300/10"
      />

      <motion.div
        style={{
          x: middleRingX,
          y: middleRingY,
        }}
        className="pointer-events-none absolute h-[450px] w-[450px] max-w-[86vw] rounded-full border border-violet-300/10"
      />

      <div className="pointer-events-none absolute h-[380px] w-[380px] max-w-[76vw] rounded-full border border-cyan-300/10" />

      {orbitItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className={item.className}
            aria-label={item.label}
          >
            <Icon className="h-5 w-5" />
          </div>
        );
      })}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        className="hero-card-shell relative z-10 flex h-[390px] w-[390px] max-w-[78vw] items-center justify-center rounded-full"
      >
        <div className="hero-rotating-ring" />

        <div className="hero-card-glow pointer-events-none absolute inset-[18px] rounded-full" />

        <div
          className="relative z-10 h-[310px] w-[310px] max-w-[62vw] overflow-hidden rounded-full border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-2xl"
          style={{
            transform: "translateZ(42px)",
          }}
        >
          <Image
            src={imageUrl || "/profile.webp"}
            alt="Mobarok Hossain"
            fill
            priority
            unoptimized={Boolean(
              imageUrl?.startsWith("http"),
            )}
            sizes="(max-width: 640px) 250px, 310px"
            className="object-cover object-[center_28%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-blue-300/5" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          x: -30,
          y: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          delay: 0.45,
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          x: leftCardX,
          y: leftCardY,
        }}
        className="premium-card absolute left-0 top-[14%] z-20 w-[250px] rounded-3xl p-4 lg:left-[-28px]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <FiTrendingUp className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-white">
              Growth Focused.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Strategic sales execution.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          x: 30,
          y: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          delay: 0.6,
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          x: rightCardX,
          y: rightCardY,
        }}
        className="premium-card absolute bottom-[5%] right-0 z-20 w-[285px] rounded-3xl px-6 py-5 text-center lg:right-[-20px]"
      >
        <p className="text-sm text-slate-400">
          Trusted across.
        </p>

        <p className="mt-2 text-xl font-bold text-white">
          {countriesReached}+ Countries Worldwide.
        </p>
      </motion.div>

      {isAvailable && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.75,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            x: badgeX,
            y: badgeY,
          }}
          className="premium-card absolute right-[4%] top-[18%] z-20 flex items-center gap-3 rounded-full px-4 py-3"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>

          <span className="text-sm font-medium text-white">
            Available for work.
          </span>
        </motion.div>
      )}
    </div>
  );
}