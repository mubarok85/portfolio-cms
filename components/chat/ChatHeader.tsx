"use client";

import {
  FiRefreshCw,
  FiStar,
  FiX,
} from "react-icons/fi";
import {
  FaWhatsapp,
} from "react-icons/fa";

type ChatHeaderProps = {
  profileImage: string;
  imageFailed: boolean;
  onImageError: () => void;
  onWhatsApp: () => void;
  onReset: () => void;
  onClose: () => void;
};

export default function ChatHeader({
  profileImage,
  imageFailed,
  onImageError,
  onWhatsApp,
  onReset,
  onClose,
}: ChatHeaderProps) {
  return (
    <header className="relative min-w-0 overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 px-4 py-4">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-violet-500/20">
            {!imageFailed ? (
              <img
                src={
                  profileImage
                }
                alt="Mubarok Hossain"
                onError={
                  onImageError
                }
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-cyan-200">
                MH.
              </div>
            )}

            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#060a16] bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-base font-bold sm:text-lg">
                Mubarok AI.
              </p>

              <FiStar className="h-4 w-4 shrink-0 text-violet-300" />

              <button
                type="button"
                onClick={
                  onWhatsApp
                }
                title="Continue on WhatsApp"
                aria-label="Continue conversation on WhatsApp"
                className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-500/10 text-emerald-300 transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                <FaWhatsapp className="h-3.5 w-3.5" />

                <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#101126] bg-emerald-400" />
              </button>
            </div>

            <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-slate-400 sm:text-[10px]">
              Chat, search and image generation.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={
              onReset
            }
            aria-label="Start a new conversation"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close chatbot"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}