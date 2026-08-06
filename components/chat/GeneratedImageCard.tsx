"use client";

import {
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import { useState } from "react";

type GeneratedImageCardProps = {
  imageUrl: string;
  prompt: string;
  isRegenerating?: boolean;
  onRegenerate: () => void;
};

export default function GeneratedImageCard({
  imageUrl,
  prompt,
  isRegenerating = false,
  onRegenerate,
}: GeneratedImageCardProps) {
  const [copied, setCopied] =
    useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(
        prompt,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadImage() {
    const anchor =
      document.createElement("a");

    anchor.href = imageUrl;

    anchor.download =
      `mubarok-ai-${Date.now()}.png`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();
  }

  function openFullSize() {
    window.open(
      imageUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-square overflow-hidden bg-[#030610]">
        <img
          src={imageUrl}
          alt={prompt}
          className="h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-200 backdrop-blur-xl">
          AI generated.
        </span>
      </div>

      <div className="p-3.5">
        <p className="line-clamp-3 text-xs leading-5 text-slate-400">
          {prompt}
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={
              downloadImage
            }
            title="Download image"
            aria-label="Download generated image"
            className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <FiDownload className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={copyPrompt}
            title={
              copied
                ? "Prompt copied"
                : "Copy prompt"
            }
            aria-label="Copy image prompt"
            className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-violet-300/25 hover:bg-violet-400/10 hover:text-violet-200"
          >
            <FiCopy className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={
              openFullSize
            }
            title="Open full-size image"
            aria-label="Open generated image"
            className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-blue-300/25 hover:bg-blue-400/10 hover:text-blue-200"
          >
            <FiExternalLink className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={
              onRegenerate
            }
            disabled={
              isRegenerating
            }
            title="Regenerate image"
            aria-label="Regenerate image"
            className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${
                isRegenerating
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}