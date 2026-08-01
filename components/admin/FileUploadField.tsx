"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

type FileUploadFieldProps = {
  label: string;
  folder: string;
  value: string;
  accept: string;
  helperText?: string;
  onChange: (url: string) => void;
};

export default function FileUploadField({
  label,
  folder,
  value,
  accept,
  helperText,
  onChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const acceptedTypes = accept
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  function isFileAccepted(file: File) {
    return acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const prefix = type.replace("/*", "");

        return file.type.startsWith(`${prefix}/`);
      }

      return file.type === type;
    });
  }

  async function uploadFile(file: File) {
    setIsUploading(true);
    setMessage("");
    setHasError(false);

    try {
      if (!isFileAccepted(file)) {
        throw new Error(
          "This file type is not allowed.",
        );
      }

      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to upload file.",
        );
      }

      onChange(result.data.url);
      setMessage("File uploaded successfully.");
    } catch (error) {
      setHasError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload file.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadFile(file);

    event.target.value = "";
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  }

  async function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (isUploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    await uploadFile(file);
  }

  function openFilePicker() {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }

  return (
    <div>
      <label className="mb-3 block text-sm text-slate-300">
        {label}.
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openFilePicker();
          }
        }}
        className={`cursor-pointer rounded-2xl border border-dashed p-6 text-center transition ${
          isDragging
            ? "border-blue-400 bg-blue-400/10"
            : "border-white/15 bg-black/20 hover:border-blue-400/40 hover:bg-white/[0.04]"
        } ${
          isUploading
            ? "cursor-not-allowed opacity-70"
            : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={isUploading}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-2xl text-blue-200">
          ↑
        </div>

        <p className="mt-4 font-semibold text-white">
          {isUploading
            ? "Uploading file."
            : "Drag and drop your file here."}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Or click this area to choose a file.
        </p>

        {helperText && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {helperText}.
          </p>
        )}
      </div>

      {value && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500">
            Current file URL.
          </p>

          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-sm text-blue-300 hover:text-blue-200"
          >
            {value}
          </a>

          <button
            type="button"
            onClick={() => onChange("")}
            className="mt-3 text-sm text-red-300 transition hover:text-red-200"
          >
            Remove file.
          </button>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            hasError
              ? "border-red-400/20 bg-red-400/10 text-red-200"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}