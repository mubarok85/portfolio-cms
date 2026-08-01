"use client";

import {
  MouseEvent,
  ReactNode,
  useRef,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  download?: boolean;
};

export default function MagneticLink({
  href,
  children,
  className = "",
  download = false,
}: MagneticLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, {
    stiffness: 180,
    damping: 16,
    mass: 0.25,
  });

  const springY = useSpring(y, {
    stiffness: 180,
    damping: 16,
    mass: 0.25,
  });

  function handleMouseMove(event: MouseEvent<HTMLAnchorElement>) {
    const element = linkRef.current;

    if (!element) {
      return;
    }

    const rectangle = element.getBoundingClientRect();

    const offsetX =
      event.clientX - rectangle.left - rectangle.width / 2;

    const offsetY =
      event.clientY - rectangle.top - rectangle.height / 2;

    x.set(offsetX * 0.18);
    y.set(offsetY * 0.18);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={linkRef}
      href={href}
      download={download}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className={className}
    >
      {children}
    </motion.a>
  );
}