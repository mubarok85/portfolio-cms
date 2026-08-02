"use client";

import Image from "next/image";
import {
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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

const FALLBACK_IMAGE = "/profile.webp";

const orbitItems = [
  {
    icon: FiTrendingUp,
    label: "Sales Growth",
    position:
      "left-[8%] top-[15%] sm:left-[14%] sm:top-[9%]",
    color: "text-blue-200",
    delay: 0,
  },
  {
    icon: FiMessageCircle,
    label: "Client Communication",
    position:
      "right-[6%] top-[31%] sm:right-[9%] sm:top-[29%]",
    color: "text-violet-200",
    delay: 0.6,
  },
  {
    icon: FiGlobe,
    label: "Global Reach",
    position:
      "bottom-[31%] left-[7%] sm:bottom-[24%] sm:left-[11%]",
    color: "text-cyan-200",
    delay: 1.2,
  },
  {
    icon: FiBarChart2,
    label: "Business Strategy",
    position:
      "bottom-[25%] right-[9%] sm:bottom-[17%] sm:right-[17%]",
    color: "text-indigo-200",
    delay: 1.8,
  },
];

export default function HeroCard({
  imageUrl,
  countriesReached = 50,
  isAvailable = true,
}: HeroCardProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [resolvedImageUrl, setResolvedImageUrl] =
    useState(FALLBACK_IMAGE);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 105,
    damping: 24,
    mass: 0.35,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 105,
    damping: 24,
    mass: 0.35,
  });

  const rotateX = useTransform(
    smoothY,
    [-0.5, 0.5],
    [4, -4],
  );

  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-4, 4],
  );

  const outerRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-7, 7],
  );

  const outerRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-7, 7],
  );

  const middleRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [5, -5],
  );

  const middleRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [5, -5],
  );

  useEffect(() => {
    setResolvedImageUrl(
      imageUrl?.trim() || FALLBACK_IMAGE,
    );
  }, [imageUrl]);

  function handleMouseMove(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (window.innerWidth < 1024) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return;
    }

    const rectangle =
      element.getBoundingClientRect();

    mouseX.set(
      (event.clientX - rectangle.left) /
        rectangle.width -
        0.5,
    );

    mouseY.set(
      (event.clientY - rectangle.top) /
        rectangle.height -
        0.5,
    );
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleImageError() {
    if (resolvedImageUrl !== FALLBACK_IMAGE) {
      setResolvedImageUrl(FALLBACK_IMAGE);
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex min-h-[540px] w-full max-w-[720px] items-start justify-center overflow-hidden sm:min-h-[670px] sm:items-center xl:overflow-visible"
    >
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[85px] sm:top-[43%] sm:h-[520px] sm:w-[520px]" />

      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[95px] sm:top-[43%] sm:h-[460px] sm:w-[460px]" />

      <motion.div
        style={{
          x: outerRingX,
          y: outerRingY,
        }}
        className="pointer-events-none absolute left-1/2 top-[38%] h-[325px] w-[325px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10 sm:top-[43%] sm:h-[540px] sm:w-[540px]"
      />

      <motion.div
        style={{
          x: middleRingX,
          y: middleRingY,
        }}
        className="pointer-events-none absolute left-1/2 top-[38%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/10 sm:top-[43%] sm:h-[465px] sm:w-[465px]"
      />

      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[235px] w-[235px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 sm:top-[43%] sm:h-[395px] sm:w-[395px]" />

      {orbitItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              scale: 0.75,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0],
              rotate: [0, 4, 0, -4, 0],
            }}
            transition={{
              opacity: {
                delay: 0.25 + index * 0.08,
                duration: 0.4,
              },
              scale: {
                delay: 0.25 + index * 0.08,
                duration: 0.4,
              },
              y: {
                delay: item.delay,
                duration: 4.8 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                delay: item.delay,
                duration: 6 + index * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            aria-label={item.label}
            className={`absolute z-30 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1225]/95 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:h-12 sm:w-12 ${item.color} ${item.position}`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
        );
      })}

      <motion.div
        initial={{
          opacity: 0,
          y: 24,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        className="hero-card-shell relative z-10 mt-10 flex h-[285px] w-[285px] items-center justify-center rounded-full sm:mt-0 sm:h-[410px] sm:w-[410px]"
      >
        <div className="hero-rotating-ring" />

        <div className="hero-card-glow pointer-events-none absolute inset-[14px] rounded-full sm:inset-[18px]" />

        <div
          className="relative z-10 h-[226px] w-[226px] overflow-hidden rounded-full border border-white/10 bg-[#050816] shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:h-[326px] sm:w-[326px]"
          style={{
            transform: "translateZ(38px)",
          }}
        >
          <Image
            key={resolvedImageUrl}
            src={resolvedImageUrl}
            alt="Mobarok Hossain"
            fill
            priority
            fetchPriority="high"
            onError={handleImageError}
            sizes="(max-width: 640px) 226px, (max-width: 1024px) 326px, 326px"
            className="object-cover object-[center_24%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/45 via-transparent to-blue-300/5" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      </motion.div>

      <div className="absolute inset-x-1 bottom-3 z-40 grid grid-cols-3 gap-2 sm:inset-x-4 sm:bottom-5 sm:gap-4">
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="premium-card flex min-h-[92px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center sm:min-h-[116px] sm:rounded-3xl sm:px-5 sm:py-5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300 sm:h-10 sm:w-10 sm:rounded-2xl">
            <FiTrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <p className="mt-2 text-[11px] font-semibold leading-4 text-white sm:text-sm">
            Growth Focused.
          </p>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -7, 0],
          }}
          transition={{
            duration: 5.8,
            delay: 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="premium-card flex min-h-[92px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center sm:min-h-[116px] sm:rounded-3xl sm:px-5 sm:py-5"
        >
          <p className="text-[9px] leading-4 text-slate-400 sm:text-xs">
            Trusted across.
          </p>

          <p className="mt-1 text-[12px] font-bold leading-4 text-white sm:mt-2 sm:text-lg sm:leading-6">
            {countriesReached}+ Countries.
          </p>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5.5,
            delay: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="premium-card flex min-h-[92px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center sm:min-h-[116px] sm:rounded-3xl sm:px-5 sm:py-5"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>

          <p className="mt-2 text-[11px] font-semibold leading-4 text-white sm:text-sm">
            {isAvailable
              ? "Available."
              : "Unavailable."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}