"use client";

import {
  FiCheck,
  FiLoader,
  FiX,
} from "react-icons/fi";
import {
  formatFileSize,
} from "./image-compression";
import type {
  PendingImageAttachment,
} from "./types";

type ImageAttachmentPreviewProps = {
  attachments: PendingImageAttachment[];
  disabled: boolean;
  onRemove: (
    id: string,
  ) => void;
};

export default function ImageAttachmentPreview({
  attachments,
  disabled,
  onRemove,
}: ImageAttachmentPreviewProps) {
  if (
    attachments.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {attachments.map(
        (attachment) => (
          <div
            key={
              attachment.id
            }
            className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30"
          >
            <img
              src={
                attachment.previewUrl
              }
              alt={
                attachment.originalName
              }
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 pb-1.5 pt-5">
              <p className="truncate text-[8px] text-white">
                {
                  attachment.originalName
                }
              </p>

              <p className="text-[7px] text-slate-400">
                {formatFileSize(
                  attachment.optimizedSize,
                )}
              </p>
            </div>

            <button
              type="button"
              disabled={
                disabled
              }
              onClick={() => {
                onRemove(
                  attachment.id,
                );
              }}
              aria-label={`Remove ${attachment.originalName}`}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiX className="h-3 w-3" />
            </button>

            {attachment.status ===
              "uploading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65">
                <FiLoader className="h-4 w-4 animate-spin text-cyan-300" />

                <span className="mt-1 text-[8px] text-white">
                  {
                    attachment.progress
                  }
                  %.
                </span>
              </div>
            )}

            {attachment.status ===
              "uploaded" && (
              <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <FiCheck className="h-3 w-3" />
              </span>
            )}

            {attachment.status ===
              "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-rose-950/80 px-2 text-center text-[8px] leading-3 text-rose-100">
                {
                  attachment.error ||
                  "Upload failed."
                }
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
