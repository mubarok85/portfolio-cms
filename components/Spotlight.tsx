"use client";

import { MouseEvent, ReactNode, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

export default function Spotlight({
  children,
  className = "",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const smoothX = useSpring(mouseX, {
    stiffness: 180,
    damping: 26,
    mass: 0.25,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 180,
    damping: 26,
    mass: 0.25,
  });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const rectangle = element.getBoundingClientRect();

    mouseX.set(event.clientX - rectangle.left);
    mouseY.set(event.clientY - rectangle.top);
  }

  function handleMouseLeave() {
    mouseX.set(-300);
    mouseY.set(-300);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        aria-hidden="true"
        style={{
          left: smoothX,
          top: smoothY,
        }}
        className="pointer-events-none absolute z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[90px]"
      />

      <motion.div
        aria-hidden="true"
        style={{
          left: smoothX,
          top: smoothY,
        }}
        className="pointer-events-none absolute z-0 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-[55px]"
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}