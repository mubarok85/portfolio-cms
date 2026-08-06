"use client";

import {
  FormEvent,
  KeyboardEvent,
} from "react";
import {
  FiSend,
  FiSquare,
} from "react-icons/fi";

type ChatInputProps = {
  value: string;
  isBusy: boolean;
  onChange: (
    value: string,
  ) => void;
  onSend: (
    value: string,
  ) => void;
  onStop: () => void;
};

export default function ChatInput({
  value,
  isBusy,
  onChange,
  onSend,
  onStop,
}: ChatInputProps) {
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isBusy) {
      onStop();

      return;
    }

    onSend(value);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!isBusy) {
        onSend(value);
      }
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="relative border-t border-white/10 bg-[#060a16] p-4"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_52px] items-end gap-3">
        <textarea
          rows={1}
          value={value}
          disabled={isBusy}
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            isBusy
              ? "Generating response."
              : "Ask or generate an image."
          }
          className="min-h-[52px] max-h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={
            !isBusy &&
            !value.trim()
          }
          aria-label={
            isBusy
              ? "Stop generating"
              : "Send message"
          }
          title={
            isBusy
              ? "Stop generating"
              : "Send message"
          }
          className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl shadow-[0_12px_32px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${
            isBusy
              ? "border border-white/15 bg-white/[0.09] text-white"
              : "bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-slate-950"
          }`}
        >
          {isBusy ? (
            <FiSquare className="h-4 w-4 fill-current" />
          ) : (
            <FiSend className="h-5 w-5" />
          )}
        </button>
      </div>

      <p className="mt-3 text-center text-[9px] leading-4 text-slate-600 sm:text-[10px]">
        Free image generation is quota-limited. AI outputs may be incorrect.
      </p>
    </form>
  );
}