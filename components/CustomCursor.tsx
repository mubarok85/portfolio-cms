"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const smoothX = useSpring(cursorX, {
    stiffness: 500,
    damping: 35,
    mass: 0.2,
  });

  const smoothY = useSpring(cursorY, {
    stiffness: 500,
    damping: 35,
    mass: 0.2,
  });

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="custom-cursor-dot"
      />

      <motion.div
        aria-hidden="true"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="custom-cursor-ring"
      />
    </>
  );
}