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

const orbitIcons = [
  {
    icon: FiTrendingUp,
    label: "Sales Growth",
    position:
      "left-[12%] top-[9%] sm:left-[15%] sm:top-[8%]",
    color: "text-blue-200",
  },
  {
    icon: FiMessageCircle,
    label: "Client Communication",
    position:
      "right-[8%] top-[29%] sm:right-[9%] sm:top-[28%]",
    color: "text-violet-200",
  },
  {
    icon: FiGlobe,
    label: "Global Reach",
    position:
      "bottom-[15%] left-[10%] sm:bottom-[13%] sm:left-[12%]",
    color: "text-cyan-200",
  },
  {
    icon: FiBarChart2,
    label: "Business Strategy",
    position:
      "bottom-[8%] right-[16%] sm:bottom-[7%] sm:right-[18%]",
    color: "text-indigo-200",
  },
];

export default function HeroCard({
  imageUrl,
  countriesReached = 50,
  isAvailable = true,
}: HeroCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    [5, -5],
  );

  const rotateY = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-5, 5],
  );

  const outerRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [-8, 8],
  );

  const outerRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [-8, 8],
  );

  const middleRingX = useTransform(
    smoothX,
    [-0.5, 0.5],
    [6, -6],
  );

  const middleRingY = useTransform(
    smoothY,
    [-0.5, 0.5],
    [6, -6],
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

  const isRemoteImage =
    resolvedImageUrl.startsWith("http://") ||
    resolvedImageUrl.startsWith("https://");

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex min-h-[520px] w-full max-w-[680px] items-center justify-center overflow-hidden sm:min-h-[610px] xl:overflow-visible"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[90px] sm:h-[500px] sm:w-[500px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px] sm:h-[430px] sm:w-[430px]" />

      <motion.div
        style={{
          x: outerRingX,
          y: outerRingY,
        }}
        className="pointer-events-none absolute h-[360px] w-[360px] rounded-full border border-blue-300/10 sm:h-[520px] sm:w-[520px]"
      />

      <motion.div
        style={{
          x: middleRingX,
          y: middleRingY,
        }}
        className="pointer-events-none absolute h-[305px] w-[305px] rounded-full border border-violet-300/10 sm:h-[450px] sm:w-[450px]"
      />

      <div className="pointer-events-none absolute h-[260px] w-[260px] rounded-full border border-cyan-300/10 sm:h-[390px] sm:w-[390px]" />

      {orbitIcons.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -7, 0],
            }}
            transition={{
              opacity: {
                delay: 0.3 + index * 0.08,
                duration: 0.45,
              },
              scale: {
                delay: 0.3 + index * 0.08,
                duration: 0.45,
              },
              y: {
                delay: index * 0.35,
                duration: 4.6 + index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            aria-label={item.label}
            className={`absolute z-20 hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1225]/90 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:flex sm:h-12 sm:w-12 ${item.position} ${item.color}`}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        );
      })}

      <motion.div
        initial={{
          opacity: 0,
          y: 28,
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
        className="hero-card-shell relative z-10 flex h-[300px] w-[300px] items-center justify-center rounded-full sm:h-[400px] sm:w-[400px]"
      >
        <div className="hero-rotating-ring" />

        <div className="hero-card-glow pointer-events-none absolute inset-[14px] rounded-full sm:inset-[18px]" />

        <div
          className="relative z-10 h-[238px] w-[238px] overflow-hidden rounded-full border border-white/10 bg-[#050816] shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:h-[318px] sm:w-[318px]"
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
            unoptimized={isRemoteImage}
            onError={handleImageError}
            sizes="(max-width: 640px) 238px, 318px"
            className="object-cover object-[center_24%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/45 via-transparent to-blue-300/5" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 z-30 grid w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 gap-3 sm:grid-cols-2 xl:hidden">
        <div className="premium-card rounded-2xl px-4 py-4 text-center">
          <p className="text-xs text-slate-400">
            Trusted across.
          </p>

          <p className="mt-1 font-bold text-white">
            {countriesReached}+ Countries Worldwide.
          </p>
        </div>

        {isAvailable && (
          <div className="premium-card flex items-center justify-center gap-3 rounded-2xl px-4 py-4">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            <span className="text-sm font-medium text-white">
              Available for work.
            </span>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-[14%] z-30 hidden items-end justify-between gap-6 px-3 xl:flex">
        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 0.65,
          }}
          className="premium-card w-[220px] rounded-3xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <FiTrendingUp className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Growth Focused.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Strategic sales execution.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.58,
            duration: 0.65,
          }}
          className="premium-card w-[220px] rounded-3xl px-5 py-4 text-center"
        >
          <p className="text-xs text-slate-400">
            Trusted across.
          </p>

          <p className="mt-2 text-lg font-bold leading-6 text-white">
            {countriesReached}+ Countries Worldwide.
          </p>
        </motion.div>

        {isAvailable && (
          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.66,
              duration: 0.65,
            }}
            className="premium-card flex w-[220px] items-center justify-center gap-3 rounded-3xl px-4 py-5"
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            <span className="text-sm font-medium text-white">
              Available for work.
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}