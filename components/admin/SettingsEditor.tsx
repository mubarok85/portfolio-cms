"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import FileUploadField from "./FileUploadField";

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
  navbar_image_url: string;
  favicon_url: string;
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
  navbar_image_url: "",
  favicon_url: "",
};

function normalizeSettings(
  data?: Partial<SettingsData> | null,
): SettingsData {
  return {
    site_title:
      data?.site_title || "",

    site_description:
      data?.site_description || "",

    email:
      data?.email || "",

    phone:
      data?.phone || "",

    location:
      data?.location || "",

    availability_text:
      data?.availability_text || "",

    linkedin_url:
      data?.linkedin_url || "",

    github_url:
      data?.github_url || "",

    facebook_url:
      data?.facebook_url || "",

    copyright_text:
      data?.copyright_text || "",

    navbar_image_url:
      data?.navbar_image_url || "",

    favicon_url:
      data?.favicon_url || "",
  };
}

export default function SettingsEditor() {
  const [formData, setFormData] =
    useState<SettingsData>(
      initialSettings,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(
          "/api/settings",
          {
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to load settings.",
          );
        }

        setFormData(
          normalizeSettings(result.data),
        );
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

  function updateField<
    K extends keyof SettingsData,
  >(
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
      const response = await fetch(
        "/api/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formData,
          ),
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to save settings.",
        );
      }

      setFormData(
        normalizeSettings(result.data),
      );

      setMessage(
        "Settings saved successfully.",
      );
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
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
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
                updateField(
                  "site_title",
                  event.target.value,
                )
              }
              placeholder="Mubarok Hossain"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />

            <p className="mt-2 text-xs text-slate-500">
              This title appears in the
              navbar and browser metadata.
            </p>
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
                updateField(
                  "location",
                  event.target.value,
                )
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
              value={
                formData.site_description
              }
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
              value={
                formData.availability_text
              }
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
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="text-2xl font-bold">
          Branding Images.
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Upload square images for the
          best appearance. A 512 by 512
          pixel PNG, JPG, or WebP image
          is recommended.
        </p>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <FileUploadField
            label="Navbar Profile Image"
            folder="settings/navbar"
            value={
              formData.navbar_image_url
            }
            accept="image/jpeg,image/png,image/webp"
            helperText="This image appears beside your name in the navbar"
            onChange={(url) =>
              updateField(
                "navbar_image_url",
                url,
              )
            }
          />

          <FileUploadField
            label="Browser Favicon"
            folder="settings/favicon"
            value={formData.favicon_url}
            accept="image/jpeg,image/png,image/webp"
            helperText="Use a simple square image because browser tab icons are very small"
            onChange={(url) =>
              updateField(
                "favicon_url",
                url,
              )
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
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
                updateField(
                  "email",
                  event.target.value,
                )
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
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="+880..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
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
              value={
                formData.linkedin_url
              }
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
              value={
                formData.facebook_url
              }
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
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
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
            value={
              formData.copyright_text
            }
            onChange={(event) =>
              updateField(
                "copyright_text",
                event.target.value,
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
          />
        </div>
      </section>

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
          : "Save Settings"}
      </button>
    </form>
  );
}