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
    orbitClass: "hero-planet-orbit-one",
    colorClass: "text-blue-200",
  },
  {
    icon: FiMessageCircle,
    label: "Client Communication",
    orbitClass: "hero-planet-orbit-two",
    colorClass: "text-violet-200",
  },
  {
    icon: FiGlobe,
    label: "Global Reach",
    orbitClass: "hero-planet-orbit-three",
    colorClass: "text-cyan-200",
  },
  {
    icon: FiBarChart2,
    label: "Business Strategy",
    orbitClass: "hero-planet-orbit-four",
    colorClass: "text-indigo-200",
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

  const isRemoteImage =
    resolvedImageUrl.startsWith("http://") ||
    resolvedImageUrl.startsWith("https://");

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex min-h-[540px] w-full max-w-[720px] items-center justify-center overflow-hidden sm:min-h-[650px] xl:overflow-visible"
    >
      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[95px] sm:h-[520px] sm:w-[520px]" />

      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[105px] sm:h-[460px] sm:w-[460px]" />

      <motion.div
        style={{
          x: outerRingX,
          y: outerRingY,
        }}
        className="pointer-events-none absolute left-1/2 top-[46%] h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10 sm:h-[540px] sm:w-[540px]"
      />

      <motion.div
        style={{
          x: middleRingX,
          y: middleRingY,
        }}
        className="pointer-events-none absolute left-1/2 top-[46%] h-[315px] w-[315px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/10 sm:h-[465px] sm:w-[465px]"
      />

      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[265px] w-[265px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 sm:h-[395px] sm:w-[395px]" />

      <div className="pointer-events-none absolute left-1/2 top-[46%] hidden h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 sm:block">
        {orbitItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`hero-planet-orbit ${item.orbitClass}`}
              aria-label={item.label}
            >
              <div
                className={`hero-planet-icon ${item.colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

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
        className="hero-card-shell relative z-10 mb-20 flex h-[300px] w-[300px] items-center justify-center rounded-full sm:mb-24 sm:h-[410px] sm:w-[410px]"
      >
        <div className="hero-rotating-ring" />

        <div className="hero-card-glow pointer-events-none absolute inset-[14px] rounded-full sm:inset-[18px]" />

        <div
          className="relative z-10 h-[238px] w-[238px] overflow-hidden rounded-full border border-white/10 bg-[#050816] shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:h-[326px] sm:w-[326px]"
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
            sizes="(max-width: 640px) 238px, 326px"
            className="object-cover object-[center_24%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/45 via-transparent to-blue-300/5" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-5 z-30 hidden grid-cols-3 gap-4 px-4 xl:grid">
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="premium-card min-h-[116px] rounded-3xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
              <FiTrendingUp className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-white">
                Growth Focused.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Strategic sales execution.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5.8,
            delay: 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="premium-card min-h-[116px] rounded-3xl p-5 text-center"
        >
          <p className="text-sm text-slate-400">
            Trusted across.
          </p>

          <p className="mt-3 text-xl font-bold leading-7 text-white">
            {countriesReached}+ Countries Worldwide.
          </p>
        </motion.div>

        {isAvailable ? (
          <motion.div
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 5.5,
              delay: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="premium-card flex min-h-[116px] items-center justify-center rounded-3xl p-5"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>

              <span className="font-medium text-white">
                Available for work.
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="premium-card min-h-[116px] rounded-3xl p-5" />
        )}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-30 grid gap-3 sm:grid-cols-2 xl:hidden">
        <div className="premium-card rounded-2xl px-5 py-4 text-center">
          <p className="text-xs text-slate-400">
            Trusted across.
          </p>

          <p className="mt-1 font-bold text-white">
            {countriesReached}+ Countries Worldwide.
          </p>
        </div>

        {isAvailable && (
          <div className="premium-card flex items-center justify-center gap-3 rounded-2xl px-5 py-4">
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
    </div>
  );
}