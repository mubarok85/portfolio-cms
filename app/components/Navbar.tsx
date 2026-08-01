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

type NavbarSettings = {
  site_title?: string | null;
  navbar_image_url?: string | null;
};

const DEFAULT_IMAGE = "/profile.webp";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [siteTitle, setSiteTitle] =
    useState("Mubarok Hossain");

  const [navbarImage, setNavbarImage] =
    useState(DEFAULT_IMAGE);

  const [displayedImage, setDisplayedImage] =
    useState(DEFAULT_IMAGE);

  const [isImageVisible, setIsImageVisible] =
    useState(false);

  useEffect(() => {
    async function loadNavbarSettings() {
      try {
        const response = await fetch(
          `/api/settings?navbar=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          const settings =
            result.data as NavbarSettings;

          const nextTitle =
            settings.site_title?.trim() ||
            "Mubarok Hossain";

          const nextImage =
            settings.navbar_image_url?.trim() ||
            DEFAULT_IMAGE;

          setSiteTitle(nextTitle);
          setNavbarImage(nextImage);
          setDisplayedImage(nextImage);
          setIsImageVisible(false);

          return;
        }

        setSiteTitle("Mubarok Hossain");
        setNavbarImage(DEFAULT_IMAGE);
        setDisplayedImage(DEFAULT_IMAGE);
      } catch {
        setSiteTitle("Mubarok Hossain");
        setNavbarImage(DEFAULT_IMAGE);
        setDisplayedImage(DEFAULT_IMAGE);
      }
    }

    loadNavbarSettings();
  }, []);

  useEffect(() => {
    setDisplayedImage(navbarImage);
    setIsImageVisible(false);
  }, [navbarImage]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleImageLoad() {
    setIsImageVisible(true);
  }

  function handleImageError() {
    if (displayedImage !== DEFAULT_IMAGE) {
      setDisplayedImage(DEFAULT_IMAGE);
      setIsImageVisible(false);

      return;
    }

    setIsImageVisible(false);
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4 md:px-6">
      <nav className="premium-navbar mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 sm:px-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-6">
        <a
          href="#home"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.06] shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
            <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-blue-400/10 to-violet-500/10" />

            <img
              key={displayedImage}
              src={displayedImage}
              alt="Mubarok Hossain"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`relative h-full w-full object-cover object-center transition-opacity duration-300 ${
                isImageVisible
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />

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

        <div className="hidden min-w-0 items-center justify-center gap-1 lg:flex">
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

        <a
          href="#contact"
          className="premium-button hidden items-center justify-center gap-3 rounded-full px-7 py-3 text-sm font-bold text-white lg:inline-flex"
        >
          Hire Me.
          <span aria-hidden="true">
            →
          </span>
        </a>

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
          className="menu-button flex lg:!hidden"
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