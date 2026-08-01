"use client";

import { useEffect, useState } from "react";

const navigationItems = [
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "Experience",
    href: "#experience",
  },
  {
    label: "Projects",
    href: "#projects",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

type SettingsData = {
  site_title?: string | null;
  navbar_image_url?: string | null;
};

const defaultSettings: SettingsData = {
  site_title: "Mubarok Hossain",
  navbar_image_url: "/profile.webp",
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [imageFailed, setImageFailed] =
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

            navbar_image_url:
              result.data.navbar_image_url ||
              defaultSettings.navbar_image_url,
          });
        }
      } catch {
        setSettings(defaultSettings);
      }
    }

    loadSettings();
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  const navbarImage =
    settings.navbar_image_url?.trim() ||
    "/profile.webp";

  const siteTitle =
    settings.site_title?.trim() ||
    "Mubarok Hossain";

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4 md:px-6">
      <nav className="premium-navbar mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4 md:px-6">
        <a
          href="#home"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.06] shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
            {!imageFailed ? (
              <img
                src={navbarImage}
                alt="Mubarok Hossain"
                onError={() =>
                  setImageFailed(true)
                }
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="text-xs font-extrabold text-white">
                MH.
              </span>
            )}

            <span className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/10" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-[-0.04em] text-white sm:text-lg">
              {siteTitle}.
            </p>

            <p className="hidden truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block sm:text-[10px] sm:tracking-[0.22em]">
              Sales Executive.
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link"
            >
              {item.label}.
            </a>
          ))}
        </div>

        <div className="hidden items-center lg:flex">
          <a
            href="#contact"
            className="premium-button inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-bold text-white"
          >
            Hire Me.
            <span aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu."
          aria-expanded={isMenuOpen}
          onClick={() =>
            setIsMenuOpen(
              (currentValue) =>
                !currentValue,
            )
          }
          className="menu-button lg:hidden"
        >
          <span
            className={`menu-line ${
              isMenuOpen
                ? "translate-y-2 rotate-45"
                : ""
            }`}
          />

          <span
            className={`menu-line ${
              isMenuOpen
                ? "opacity-0"
                : ""
            }`}
          />

          <span
            className={`menu-line ${
              isMenuOpen
                ? "-translate-y-2 -rotate-45"
                : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`mx-auto max-w-7xl overflow-hidden transition-all duration-500 lg:hidden ${
          isMenuOpen
            ? "mt-3 max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mobile-menu">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="mobile-link"
            >
              {item.label}.
            </a>
          ))}

          <a
            href="#contact"
            onClick={closeMenu}
            className="premium-button mt-2 inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 font-semibold text-white"
          >
            Hire Me.
            <span aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}