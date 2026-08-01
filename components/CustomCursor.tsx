"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const pathname = usePathname();

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const pointerX = useRef(-100);
  const pointerY = useRef(-100);
  const ringX = useRef(-100);
  const ringY = useRef(-100);

  const animationFrame = useRef<number | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(pointer: fine)",
    ).matches;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const shouldEnable =
      finePointer &&
      !reducedMotion &&
      !isAdminPage;

    setEnabled(shouldEnable);

    if (!shouldEnable) {
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";

      return;
    }

    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    function updateCursor() {
      ringX.current +=
        (pointerX.current - ringX.current) * 0.3;

      ringY.current +=
        (pointerY.current - ringY.current) * 0.3;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${pointerX.current}px, ${pointerY.current}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${ringX.current}px, ${ringY.current}px, 0) translate(-50%, -50%)`;
      }

      animationFrame.current =
        requestAnimationFrame(updateCursor);
    }

    function handleMouseMove(
      event: MouseEvent,
    ) {
      pointerX.current = event.clientX;
      pointerY.current = event.clientY;

      setVisible(true);

      const target =
        event.target as HTMLElement | null;

      setHovering(
        Boolean(
          target?.closest(
            "a, button, input, textarea, select, [role='button']",
          ),
        ),
      );
    }

    function handleMouseLeave() {
      setVisible(false);
    }

    function handleMouseEnter() {
      setVisible(true);
    }

    animationFrame.current =
      requestAnimationFrame(updateCursor);

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "mouseleave",
      handleMouseLeave,
    );

    document.addEventListener(
      "mouseenter",
      handleMouseEnter,
    );

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(
          animationFrame.current,
        );
      }

      window.removeEventListener(
        "mousemove",
        handleMouseMove,
      );

      document.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      );

      document.removeEventListener(
        "mouseenter",
        handleMouseEnter,
      );

      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
    };
  }, [isAdminPage]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[99998] rounded-full border border-blue-300/70 bg-blue-300/[0.04] shadow-[0_0_18px_rgba(147,197,253,0.22)] transition-[width,height,opacity] duration-150 ${
          hovering
            ? "h-12 w-12"
            : "h-8 w-8"
        } ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }`}
        style={{
          willChange: "transform",
        }}
      />

      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[99999] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference transition-[opacity,scale] duration-100 ${
          hovering
            ? "scale-150"
            : "scale-100"
        } ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }`}
        style={{
          willChange: "transform",
        }}
      />
    </>
  );
}