"use client";

import { FormEvent, useEffect, useState } from "react";
import FileUploadField from "./FileUploadField";

type HeroData = {
  id?: string;
  badge_text: string;
  title: string;
  highlighted_title: string;
  description: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  resume_url: string;
  profile_image_url: string;
  clients_supported: number;
  countries_reached: number;
  years_experience: number;
  is_available: boolean;
};

const initialHeroData: HeroData = {
  badge_text: "",
  title: "",
  highlighted_title: "",
  description: "",
  primary_button_text: "",
  primary_button_url: "",
  secondary_button_text: "",
  resume_url: "",
  profile_image_url: "",
  clients_supported: 0,
  countries_reached: 0,
  years_experience: 0,
  is_available: true,
};

export default function HeroEditor() {
  const [formData, setFormData] =
    useState<HeroData>(initialHeroData);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadHero() {
      try {
        const response = await fetch("/api/hero", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load hero content.",
          );
        }

        if (result.data) {
          setFormData({
            ...initialHeroData,
            ...result.data,
            resume_url: result.data.resume_url || "",
            profile_image_url:
              result.data.profile_image_url || "",
          });
        }
      } catch (error) {
        setHasError(true);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load hero content.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHero();
  }, []);

  function updateField<K extends keyof HeroData>(
    field: K,
    value: HeroData[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save hero content.",
        );
      }

      setFormData({
        ...initialHeroData,
        ...result.data,
        resume_url: result.data.resume_url || "",
        profile_image_url:
          result.data.profile_image_url || "",
      });

      setMessage("Hero content saved successfully.");
    } catch (error) {
      setHasError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save hero content.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-slate-400">
          Loading hero content.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Hero Content.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Badge Text.
            </label>

            <input
              type="text"
              required
              value={formData.badge_text}
              onChange={(event) =>
                updateField(
                  "badge_text",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Main Title.
            </label>

            <input
              type="text"
              required
              value={formData.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Highlighted Title.
            </label>

            <input
              type="text"
              required
              value={formData.highlighted_title}
              onChange={(event) =>
                updateField(
                  "highlighted_title",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Description.
            </label>

            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Buttons and Files.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Primary Button Text.
            </label>

            <input
              type="text"
              required
              value={formData.primary_button_text}
              onChange={(event) =>
                updateField(
                  "primary_button_text",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Primary Button URL.
            </label>

            <input
              type="text"
              required
              value={formData.primary_button_url}
              onChange={(event) =>
                updateField(
                  "primary_button_url",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Secondary Button Text.
            </label>

            <input
              type="text"
              required
              value={formData.secondary_button_text}
              onChange={(event) =>
                updateField(
                  "secondary_button_text",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <FileUploadField
              label="Résumé File"
              folder="resume"
              value={formData.resume_url}
              accept="application/pdf"
              helperText="Upload a PDF file smaller than 6 MB"
              onChange={(url) =>
                updateField("resume_url", url)
              }
            />
          </div>

          <div className="md:col-span-2">
            <FileUploadField
              label="Profile Image"
              folder="profile"
              value={formData.profile_image_url}
              accept="image/jpeg,image/png,image/webp"
              helperText="Upload a JPG, PNG, or WebP image smaller than 6 MB"
              onChange={(url) =>
                updateField("profile_image_url", url)
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Statistics and Availability.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Clients Supported.
            </label>

            <input
              type="number"
              min={0}
              required
              value={formData.clients_supported}
              onChange={(event) =>
                updateField(
                  "clients_supported",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Countries Reached.
            </label>

            <input
              type="number"
              min={0}
              required
              value={formData.countries_reached}
              onChange={(event) =>
                updateField(
                  "countries_reached",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Years of Experience.
            </label>

            <input
              type="number"
              min={0}
              required
              value={formData.years_experience}
              onChange={(event) =>
                updateField(
                  "years_experience",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>
        </div>

        <label className="mt-8 flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
          <input
            type="checkbox"
            checked={formData.is_available}
            onChange={(event) =>
              updateField(
                "is_available",
                event.target.checked,
              )
            }
            className="h-5 w-5"
          />

          <div>
            <p className="font-semibold">
              Available for work.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Show the availability badge on the website.
            </p>
          </div>
        </label>
      </div>

      {message && (
        <p
          className={`rounded-2xl border px-5 py-4 text-sm ${
            hasError
              ? "border-red-400/20 bg-red-400/10 text-red-200"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="premium-button inline-flex w-full items-center justify-center rounded-2xl px-7 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {isSaving
          ? "Saving..."
          : "Save Hero Content"}
      </button>
    </form>
  );
}