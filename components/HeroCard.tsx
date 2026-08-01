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

const orbitItems = [
  {
    icon: FiTrendingUp,
    label: "Sales Growth",
    position:
      "left-[7%] top-[11%] sm:left-[12%] sm:top-[8%]",
    color: "text-blue-200",
  },
  {
    icon: FiMessageCircle,
    label: "Client Communication",
    position:
      "right-[7%] top-[34%] sm:right-[8%] sm:top-[30%]",
    color: "text-violet-200",
  },
  {
    icon: FiGlobe,
    label: "Global Reach",
    position:
      "bottom-[17%] left-[7%] sm:bottom-[14%] sm:left-[10%]",
    color: "text-cyan-200",
  },
  {
    icon: FiBarChart2,
    label: "Business Strategy",
    position:
      "bottom-[8%] right-[15%] sm:bottom-[5%] sm:right-[18%]",
    color: "text-indigo-200",
  },
];

export default function HeroCard({
  imageUrl = "/profile.webp",
  countriesReached = 50,
  isAvailable = true,
}: HeroCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [resolvedImageUrl, setResolvedImageUrl] =
    useState(imageUrl || "/profile.webp");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 110,
    damping: 24,
    mass: 0.35,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 110,
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
      imageUrl?.trim() || "/profile.webp",
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

  function handleImageError() {
    if (resolvedImageUrl !== "/profile.webp") {
      setResolvedImageUrl("/profile.webp");
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex min-h-[500px] w-full max-w-[620px] items-center justify-center overflow-hidden sm:min-h-[590px] lg:min-h-[640px] lg:overflow-visible"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[90px] sm:h-[470px] sm:w-[470px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px] sm:h-[420px] sm:w-[420px]" />

      <motion.div
        style={{
          x: outerRingX,
          y: outerRingY,
        }}
        className="pointer-events-none absolute h-[350px] w-[350px] rounded-full border border-blue-300/10 sm:h-[500px] sm:w-[500px] lg:h-[540px] lg:w-[540px]"
      />

      <motion.div
        style={{
          x: middleRingX,
          y: middleRingY,
        }}
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full border border-violet-300/10 sm:h-[430px] sm:w-[430px] lg:h-[470px] lg:w-[470px]"
      />

      <div className="pointer-events-none absolute h-[255px] w-[255px] rounded-full border border-cyan-300/10 sm:h-[370px] sm:w-[370px] lg:h-[400px] lg:w-[400px]" />

      {orbitItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -7, 0],
            }}
            transition={{
              opacity: {
                delay: 0.35 + index * 0.08,
                duration: 0.45,
              },
              scale: {
                delay: 0.35 + index * 0.08,
                duration: 0.45,
              },
              y: {
                delay: index * 0.4,
                duration: 4.5 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            aria-label={item.label}
            className={`absolute z-20 hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1225]/85 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:flex sm:h-12 sm:w-12 ${item.position} ${item.color}`}
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
        className="hero-card-shell relative z-10 flex h-[295px] w-[295px] items-center justify-center rounded-full sm:h-[390px] sm:w-[390px]"
      >
        <div className="hero-rotating-ring" />

        <div className="hero-card-glow pointer-events-none absolute inset-[14px] rounded-full sm:inset-[18px]" />

        <div
          className="relative z-10 h-[235px] w-[235px] overflow-hidden rounded-full border border-white/10 bg-[#050816] shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:h-[310px] sm:w-[310px]"
          style={{
            transform: "translateZ(38px)",
          }}
        >
          <Image
            key={resolvedImageUrl}
            src={resolvedImageUrl}
            alt=""
            fill
            priority
            unoptimized={resolvedImageUrl.startsWith(
              "http",
            )}
            sizes="(max-width: 640px) 235px, 310px"
            onError={handleImageError}
            className="object-cover object-[center_24%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050816]/55 via-transparent to-blue-300/5" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          x: -22,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.5,
          duration: 0.65,
        }}
        className="premium-card absolute left-0 top-[24%] z-30 hidden w-[210px] rounded-3xl p-4 xl:block"
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
          x: 22,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.58,
          duration: 0.65,
        }}
        className="premium-card absolute bottom-[17%] right-0 z-30 hidden w-[225px] rounded-3xl px-5 py-4 text-center xl:block"
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
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.65,
            duration: 0.55,
          }}
          className="premium-card absolute right-[4%] top-[16%] z-30 hidden items-center gap-3 rounded-full px-4 py-3 xl:flex"
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>

          <span className="whitespace-nowrap text-sm font-medium text-white">
            Available for work.
          </span>
        </motion.div>
      )}

      <div className="absolute bottom-5 left-1/2 z-30 w-[calc(100%-40px)] max-w-[320px] -translate-x-1/2 xl:hidden">
        <div className="premium-card rounded-2xl px-5 py-4 text-center">
          <p className="text-xs text-slate-400">
            Trusted across.
          </p>

          <p className="mt-1 font-bold text-white">
            {countriesReached}+ Countries Worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}