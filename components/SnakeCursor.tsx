"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
} from "react";

type CursorPoint = {
  x: number;
  y: number;
};

const SEGMENT_COUNT = 9;

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-magnetic='true']",
].join(",");

export default function SnakeCursor() {
  const pathname = usePathname();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const headRef =
    useRef<HTMLDivElement>(null);

  const segmentRefs =
    useRef<Array<HTMLDivElement | null>>([]);

  const pointerRef =
    useRef<CursorPoint>({
      x: -100,
      y: -100,
    });

  const headPositionRef =
    useRef<CursorPoint>({
      x: -100,
      y: -100,
    });

  const segmentPositionsRef =
    useRef<CursorPoint[]>(
      Array.from(
        {
          length: SEGMENT_COUNT,
        },
        () => ({
          x: -100,
          y: -100,
        }),
      ),
    );

  const animationFrameRef =
    useRef<number | null>(null);

  const isVisibleRef =
    useRef(false);

  const isHoveringRef =
    useRef(false);

  useEffect(() => {
    const isAdminPage =
      pathname.startsWith("/admin");

    const hasFinePointer =
      window.matchMedia(
        "(pointer: fine)",
      ).matches;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const shouldEnable =
      hasFinePointer &&
      !reducedMotion &&
      !isAdminPage;

    const rootElement =
      document.documentElement;

    const bodyElement =
      document.body;

    if (!shouldEnable) {
      rootElement.classList.remove(
        "snake-cursor-enabled",
      );

      bodyElement.classList.remove(
        "snake-cursor-enabled",
      );

      return;
    }

    const container =
      containerRef.current;

    const head =
      headRef.current;

    if (!container || !head) {
      return;
    }

    rootElement.classList.add(
      "snake-cursor-enabled",
    );

    bodyElement.classList.add(
      "snake-cursor-enabled",
    );

    function setCursorVisibility(
      isVisible: boolean,
    ) {
      isVisibleRef.current =
        isVisible;

      if (!containerRef.current) {
        return;
      }

      containerRef.current.style.opacity =
        isVisible ? "1" : "0";
    }

    function setHoverState(
      isHovering: boolean,
    ) {
      if (
        isHoveringRef.current ===
        isHovering
      ) {
        return;
      }

      isHoveringRef.current =
        isHovering;

      if (!containerRef.current) {
        return;
      }

      containerRef.current.dataset.hovering =
        isHovering
          ? "true"
          : "false";
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      pointerRef.current.x =
        event.clientX;

      pointerRef.current.y =
        event.clientY;

      if (!isVisibleRef.current) {
        headPositionRef.current.x =
          event.clientX;

        headPositionRef.current.y =
          event.clientY;

        segmentPositionsRef.current =
          segmentPositionsRef.current.map(
            () => ({
              x: event.clientX,
              y: event.clientY,
            }),
          );
      }

      setCursorVisibility(true);

      const target =
        event.target as HTMLElement | null;

      const isTextField =
        Boolean(
          target?.closest(
            "input, textarea, select, [contenteditable='true']",
          ),
        );

      const isInteractive =
        Boolean(
          target?.closest(
            INTERACTIVE_SELECTOR,
          ),
        );

      if (isTextField) {
        rootElement.classList.add(
          "snake-cursor-native",
        );

        bodyElement.classList.add(
          "snake-cursor-native",
        );

        setCursorVisibility(false);
      } else {
        rootElement.classList.remove(
          "snake-cursor-native",
        );

        bodyElement.classList.remove(
          "snake-cursor-native",
        );

        setCursorVisibility(true);
      }

      setHoverState(
        isInteractive &&
        !isTextField,
      );
    }

    function handlePointerEnter() {
      if (
        pointerRef.current.x >= 0 &&
        pointerRef.current.y >= 0
      ) {
        setCursorVisibility(true);
      }
    }

    function handlePointerLeave() {
      setCursorVisibility(false);
    }

    function handleWindowBlur() {
      setCursorVisibility(false);
    }

    function handleWindowFocus() {
      if (
        pointerRef.current.x >= 0 &&
        pointerRef.current.y >= 0
      ) {
        setCursorVisibility(true);
      }
    }

    function renderCursor() {
      const pointer =
        pointerRef.current;

      const headPosition =
        headPositionRef.current;

      headPosition.x +=
        (pointer.x -
          headPosition.x) *
        0.72;

      headPosition.y +=
        (pointer.y -
          headPosition.y) *
        0.72;

      if (headRef.current) {
        headRef.current.style.transform =
          `translate3d(${headPosition.x}px, ${headPosition.y}px, 0) translate(-50%, -50%)`;
      }

      let previousPosition =
        headPosition;

      segmentPositionsRef.current.forEach(
        (
          segmentPosition,
          index,
        ) => {
          const followStrength =
            Math.max(
              0.2,
              0.44 -
                index * 0.022,
            );

          segmentPosition.x +=
            (
              previousPosition.x -
              segmentPosition.x
            ) *
            followStrength;

          segmentPosition.y +=
            (
              previousPosition.y -
              segmentPosition.y
            ) *
            followStrength;

          const segment =
            segmentRefs.current[index];

          if (segment) {
            segment.style.transform =
              `translate3d(${segmentPosition.x}px, ${segmentPosition.y}px, 0) translate(-50%, -50%)`;
          }

          previousPosition =
            segmentPosition;
        },
      );

      animationFrameRef.current =
        window.requestAnimationFrame(
          renderCursor,
        );
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "pointerenter",
      handlePointerEnter,
    );

    document.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    window.addEventListener(
      "blur",
      handleWindowBlur,
    );

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    animationFrameRef.current =
      window.requestAnimationFrame(
        renderCursor,
      );

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      document.removeEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      document.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur,
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );

      rootElement.classList.remove(
        "snake-cursor-enabled",
      );

      bodyElement.classList.remove(
        "snake-cursor-enabled",
      );

      rootElement.classList.remove(
        "snake-cursor-native",
      );

      bodyElement.classList.remove(
        "snake-cursor-native",
      );
    };
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="snake-cursor-container"
      data-hovering="false"
    >
      {Array.from(
        {
          length: SEGMENT_COUNT,
        },
        (_, index) => (
          <div
            key={index}
            ref={(element) => {
              segmentRefs.current[
                index
              ] = element;
            }}
            className="snake-cursor-segment"
            style={{
              width: `${Math.max(
                4,
                11 - index * 0.72,
              )}px`,

              height: `${Math.max(
                4,
                11 - index * 0.72,
              )}px`,

              opacity:
                Math.max(
                  0.18,
                  0.76 -
                    index * 0.065,
                ),

              zIndex:
                99990 - index,
            }}
          />
        ),
      )}

      <div
        ref={headRef}
        className="snake-cursor-head"
      >
        <span className="snake-cursor-eye snake-cursor-eye-left" />

        <span className="snake-cursor-eye snake-cursor-eye-right" />
      </div>
    </div>
  );
}