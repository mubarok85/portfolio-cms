"use client";

import {
  FiImage,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import type {
  ThinkingMode,
} from "./types";

type ThinkingIndicatorProps = {
  mode: ThinkingMode;
};

function getThinkingLabel(
  mode: ThinkingMode,
) {
  if (
    mode === "image"
  ) {
    return "Generating image.";
  }

  if (
    mode === "live"
  ) {
    return "Searching the web.";
  }

  return "Thinking.";
}

export default function ThinkingIndicator({
  mode,
}: ThinkingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="inline-flex max-w-[88%] items-center gap-2.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
          {mode ===
          "image" ? (
            <FiImage className="h-3.5 w-3.5 animate-pulse" />
          ) : mode ===
            "live" ? (
            <FiSearch className="h-3.5 w-3.5 animate-pulse" />
          ) : (
            <FiZap className="h-3.5 w-3.5 animate-pulse" />
          )}

          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-cyan-300/60" />

          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-300" />
        </div>

        <p className="min-w-0 text-xs font-medium text-slate-300">
          {getThinkingLabel(
            mode,
          )}
        </p>

        <div
          aria-hidden="true"
          className="ml-1 flex shrink-0 items-center gap-1"
        >
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}