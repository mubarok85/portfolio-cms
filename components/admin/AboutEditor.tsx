"use client";

import { FormEvent, useEffect, useState } from "react";
import FileUploadField from "./FileUploadField";

type AboutData = {
  id?: string;
  heading: string;
  paragraph_one: string;
  paragraph_two: string;
  paragraph_three: string;
  skills: string[];
  image_url: string;
};

const initialData: AboutData = {
  heading: "",
  paragraph_one: "",
  paragraph_two: "",
  paragraph_three: "",
  skills: [],
  image_url: "",
};

export default function AboutEditor() {
  const [formData, setFormData] =
    useState<AboutData>(initialData);

  const [skillsText, setSkillsText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadAbout() {
      try {
        const response = await fetch("/api/about", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load About content.",
          );
        }

        if (result.data) {
          const nextData: AboutData = {
            ...initialData,
            ...result.data,
            image_url: result.data.image_url || "",
            skills: Array.isArray(result.data.skills)
              ? result.data.skills
              : [],
          };

          setFormData(nextData);
          setSkillsText(nextData.skills.join(", "));
        }
      } catch (error) {
        setHasError(true);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load About content.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAbout();
  }, []);

  function updateField<K extends keyof AboutData>(
    field: K,
    value: AboutData[K],
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
      const skills = skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await fetch("/api/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save About content.",
        );
      }

      const nextData: AboutData = {
        ...initialData,
        ...result.data,
        image_url: result.data.image_url || "",
        skills: Array.isArray(result.data.skills)
          ? result.data.skills
          : [],
      };

      setFormData(nextData);
      setSkillsText(nextData.skills.join(", "));
      setMessage("About content saved successfully.");
    } catch (error) {
      setHasError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save About content.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-slate-400">
          Loading About content.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          About Content.
        </h2>

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Heading.
            </label>

            <input
              type="text"
              required
              value={formData.heading}
              onChange={(event) =>
                updateField(
                  "heading",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Paragraph One.
            </label>

            <textarea
              rows={4}
              required
              value={formData.paragraph_one}
              onChange={(event) =>
                updateField(
                  "paragraph_one",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Paragraph Two.
            </label>

            <textarea
              rows={4}
              required
              value={formData.paragraph_two}
              onChange={(event) =>
                updateField(
                  "paragraph_two",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Paragraph Three.
            </label>

            <textarea
              rows={4}
              required
              value={formData.paragraph_three}
              onChange={(event) =>
                updateField(
                  "paragraph_three",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Skills, separated by commas.
            </label>

            <textarea
              rows={4}
              value={skillsText}
              onChange={(event) =>
                setSkillsText(event.target.value)
              }
              placeholder="International Sales, Client Communication, Negotiation."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <FileUploadField
            label="About Profile Image"
            folder="about"
            value={formData.image_url}
            accept="image/jpeg,image/png,image/webp"
            helperText="Upload a JPG, PNG, or WebP image smaller than 6 MB"
            onChange={(url) =>
              updateField("image_url", url)
            }
          />
        </div>
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
          : "Save About Content"}
      </button>
    </form>
  );
}