"use client";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useRef,
} from "react";
import {
  FiImage,
  FiSend,
  FiSquare,
} from "react-icons/fi";
import ImageAttachmentPreview from "./ImageAttachmentPreview";
import {
  MAX_IMAGE_COUNT,
} from "./image-compression";
import type {
  PendingImageAttachment,
} from "./types";

type ChatInputProps = {
  value: string;
  isBusy: boolean;
  attachments: PendingImageAttachment[];
  onChange: (
    value: string,
  ) => void;
  onSend: (
    value: string,
  ) => void;
  onStop: () => void;
  onSelectImages: (
    files: File[],
  ) => void;
  onRemoveImage: (
    id: string,
  ) => void;
};

export default function ChatInput({
  value,
  isBusy,
  attachments,
  onChange,
  onSend,
  onStop,
  onSelectImages,
  onRemoveImage,
}: ChatInputProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const canSend =
    Boolean(
      value.trim() ||
      attachments.length >
        0,
    );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isBusy) {
      onStop();

      return;
    }

    onSend(
      value,
    );
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        !isBusy &&
        canSend
      ) {
        onSend(
          value,
        );
      }
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ||
          [],
      );

    event.target.value =
      "";

    if (
      files.length ===
      0
    ) {
      return;
    }

    onSelectImages(
      files,
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="relative border-t border-white/10 bg-[#060a16] p-4"
    >
      <ImageAttachmentPreview
        attachments={
          attachments
        }
        disabled={
          isBusy
        }
        onRemove={
          onRemoveImage
        }
      />

      <input
        ref={
          fileInputRef
        }
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={
          handleFileChange
        }
      />

      <div className="grid grid-cols-[42px_minmax(0,1fr)_52px] items-end gap-2.5">
        <button
          type="button"
          disabled={
            isBusy ||
            attachments.length >=
              MAX_IMAGE_COUNT
          }
          onClick={() => {
            fileInputRef.current?.click();
          }}
          aria-label="Attach images"
          title={`Attach up to ${MAX_IMAGE_COUNT} images`}
          className="flex h-[52px] w-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-400 transition hover:border-cyan-300/20 hover:bg-cyan-400/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiImage className="h-5 w-5" />
        </button>

        <textarea
          rows={1}
          value={value}
          disabled={
            isBusy
          }
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
              : attachments.length >
                  0
                ? "Ask about these images."
                : "Ask or generate an image."
          }
          className="min-h-[52px] max-h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={
            !isBusy &&
            !canSend
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
        Up to five images, 15 MB each. Images are optimized before analysis.
      </p>
    </form>
  );
}
