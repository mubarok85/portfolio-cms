"use client";

import { FormEvent, useEffect, useState } from "react";

type SettingsData = {
  site_title: string;
  site_description: string;
  email: string;
  phone: string;
  location: string;
  availability_text: string;
  linkedin_url: string;
  github_url: string;
  facebook_url: string;
  copyright_text: string;
};

const initialSettings: SettingsData = {
  site_title: "",
  site_description: "",
  email: "",
  phone: "",
  location: "",
  availability_text: "",
  linkedin_url: "",
  github_url: "",
  facebook_url: "",
  copyright_text: "",
};

export default function SettingsEditor() {
  const [formData, setFormData] =
    useState<SettingsData>(initialSettings);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load settings.",
          );
        }

        if (result.data) {
          setFormData({
            site_title: result.data.site_title || "",
            site_description:
              result.data.site_description || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            location: result.data.location || "",
            availability_text:
              result.data.availability_text || "",
            linkedin_url: result.data.linkedin_url || "",
            github_url: result.data.github_url || "",
            facebook_url: result.data.facebook_url || "",
            copyright_text:
              result.data.copyright_text || "",
          });
        }
      } catch (error) {
        setHasError(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load settings.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField<K extends keyof SettingsData>(
    field: K,
    value: SettingsData[K],
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
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save settings.",
        );
      }

      setFormData({
        site_title: result.data.site_title || "",
        site_description:
          result.data.site_description || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        location: result.data.location || "",
        availability_text:
          result.data.availability_text || "",
        linkedin_url: result.data.linkedin_url || "",
        github_url: result.data.github_url || "",
        facebook_url: result.data.facebook_url || "",
        copyright_text:
          result.data.copyright_text || "",
      });

      setMessage("Settings saved successfully.");
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-slate-400">
          Loading settings.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Website Information.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Website Title.
            </label>

            <input
              type="text"
              required
              value={formData.site_title}
              onChange={(event) =>
                updateField("site_title", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Location.
            </label>

            <input
              type="text"
              required
              value={formData.location}
              onChange={(event) =>
                updateField("location", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Website Description.
            </label>

            <textarea
              rows={4}
              required
              value={formData.site_description}
              onChange={(event) =>
                updateField(
                  "site_description",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Availability Text.
            </label>

            <input
              type="text"
              required
              value={formData.availability_text}
              onChange={(event) =>
                updateField(
                  "availability_text",
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Contact Details.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Email Address.
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Phone Number.
            </label>

            <input
              type="text"
              value={formData.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              placeholder="+880..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Social Links.
        </h2>

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              LinkedIn URL.
            </label>

            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(event) =>
                updateField(
                  "linkedin_url",
                  event.target.value,
                )
              }
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              GitHub URL.
            </label>

            <input
              type="url"
              value={formData.github_url}
              onChange={(event) =>
                updateField(
                  "github_url",
                  event.target.value,
                )
              }
              placeholder="https://github.com/..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Facebook URL.
            </label>

            <input
              type="url"
              value={formData.facebook_url}
              onChange={(event) =>
                updateField(
                  "facebook_url",
                  event.target.value,
                )
              }
              placeholder="https://facebook.com/..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Footer.
        </h2>

        <div className="mt-8">
          <label className="mb-3 block text-sm text-slate-300">
            Copyright Text.
          </label>

          <input
            type="text"
            required
            value={formData.copyright_text}
            onChange={(event) =>
              updateField(
                "copyright_text",
                event.target.value,
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
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
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}