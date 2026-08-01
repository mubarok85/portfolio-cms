"use client";

import { useEffect, useState } from "react";
import {
  FiArrowUp,
  FiFacebook,
  FiGithub,
  FiLinkedin,
  FiMail,
} from "react-icons/fi";

type SettingsData = {
  site_title: string;
  site_description: string;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  facebook_url: string | null;
  copyright_text: string;
};

const defaultSettings: SettingsData = {
  site_title: "Mobarok Hossain",
  site_description:
    "Senior Sales Executive and International Client Communication Specialist.",
  email: "your@email.com",
  linkedin_url: null,
  github_url: null,
  facebook_url: null,
  copyright_text:
    "Mobarok Hossain. All rights reserved.",
};

export default function Footer() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          setSettings({
            site_title:
              result.data.site_title ||
              defaultSettings.site_title,
            site_description:
              result.data.site_description ||
              defaultSettings.site_description,
            email:
              result.data.email ||
              defaultSettings.email,
            linkedin_url:
              result.data.linkedin_url || null,
            github_url:
              result.data.github_url || null,
            facebook_url:
              result.data.facebook_url || null,
            copyright_text:
              result.data.copyright_text ||
              defaultSettings.copyright_text,
          });
        }
      } catch {
        setSettings(defaultSettings);
      }
    }

    loadSettings();
  }, []);

  const socialLinks = [
    {
      label: "LinkedIn",
      href: settings.linkedin_url,
      icon: FiLinkedin,
    },
    {
      label: "GitHub",
      href: settings.github_url,
      icon: FiGithub,
    },
    {
      label: "Facebook",
      href: settings.facebook_url,
      icon: FiFacebook,
    },
    {
      label: "Email",
      href: settings.email
        ? `mailto:${settings.email}`
        : null,
      icon: FiMail,
    },
  ].filter(
    (
      item,
    ): item is {
      label: string;
      href: string;
      icon: typeof FiLinkedin;
    } => Boolean(item.href),
  );

  return (
    <footer className="relative border-t border-white/10 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-bold">
            {settings.site_title}.
          </p>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {settings.site_description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            const isEmail =
              item.href.startsWith("mailto:");

            return (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noreferrer"}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:-translate-y-1 hover:border-blue-300/30 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}

          <a
            href="#home"
            aria-label="Scroll to top"
            className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:-translate-y-1 hover:border-blue-300/30 hover:text-white"
          >
            Back to top.
            <FiArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-600">
        © {new Date().getFullYear()}{" "}
        {settings.copyright_text}
      </div>
    </footer>
  );
}