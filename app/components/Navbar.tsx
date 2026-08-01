"use client";

import { useEffect, useState } from "react";

const navigationItems = [
  {
    label: "About",
    href: "#about",
    sectionId: "about",
  },
  {
    label: "Services",
    href: "#services",
    sectionId: "services",
  },
  {
    label: "Experience",
    href: "#experience",
    sectionId: "experience",
  },
  {
    label: "Projects",
    href: "#projects",
    sectionId: "projects",
  },
  {
    label: "Contact",
    href: "#contact",
    sectionId: "contact",
  },
];

type NavbarSettings = {
  site_title?: string | null;
  navbar_image_url?: string | null;
};

const DEFAULT_TITLE = "Mubarok Hossain";
const DEFAULT_IMAGE = "/profile.webp";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [siteTitle, setSiteTitle] =
    useState(DEFAULT_TITLE);

  const [imageUrl, setImageUrl] =
    useState(DEFAULT_IMAGE);

  const [activeSection, setActiveSection] =
    useState("home");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(
          `/api/settings?t=${Date.now()}`,
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

          setSiteTitle(
            settings.site_title?.trim() ||
              DEFAULT_TITLE,
          );

          setImageUrl(
            settings.navbar_image_url?.trim() ||
              DEFAULT_IMAGE,
          );
        }
      } catch {
        setSiteTitle(DEFAULT_TITLE);
        setImageUrl(DEFAULT_IMAGE);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "services",
      "experience",
      "projects",
      "contact",
    ];

    function updateActiveSection() {
      const navbarOffset = 140;
      const scrollPosition =
        window.scrollY + navbarOffset;

      let currentSection = "home";

      for (const sectionId of sectionIds) {
        const section =
          document.getElementById(sectionId);

        if (!section) {
          continue;
        }

        const sectionTop =
          section.offsetTop;

        if (scrollPosition >= sectionTop) {
          currentSection = sectionId;
        }
      }

      const nearPageBottom =
        window.innerHeight +
          window.scrollY >=
        document.documentElement.scrollHeight -
          80;

      if (
        nearPageBottom &&
        document.getElementById("contact")
      ) {
        currentSection = "contact";
      }

      setActiveSection(currentSection);
    }

    updateActiveSection();

    window.addEventListener(
      "scroll",
      updateActiveSection,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateActiveSection,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateActiveSection,
      );

      window.removeEventListener(
        "resize",
        updateActiveSection,
      );
    };
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleNavigationClick(
    sectionId: string,
  ) {
    setActiveSection(sectionId);
    closeMenu();
  }

  function handleImageError() {
    if (imageUrl !== DEFAULT_IMAGE) {
      setImageUrl(DEFAULT_IMAGE);
    }
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 pt-3 sm:px-4 sm:pt-4 md:px-6">
      <nav className="premium-navbar mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 sm:px-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-6">
        <a
          href="#home"
          onClick={() =>
            handleNavigationClick("home")
          }
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-slate-900 shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Mubarok Hossain"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            <span className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/15" />
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
          {navigationItems.map((item) => {
            const isActive =
              activeSection === item.sectionId;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() =>
                  handleNavigationClick(
                    item.sectionId,
                  )
                }
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="relative z-10">
                  {item.label}.
                </span>

                <span
                  className={`absolute inset-x-3 bottom-1 h-px origin-center bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 transition duration-300 ${
                    isActive
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }`}
                />

                <span
                  className={`absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] transition duration-300 ${
                    isActive
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </div>

        <a
          href="#contact"
          onClick={() =>
            handleNavigationClick("contact")
          }
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
          {navigationItems.map((item) => {
            const isActive =
              activeSection === item.sectionId;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() =>
                  handleNavigationClick(
                    item.sectionId,
                  )
                }
                className={`mobile-link relative flex items-center justify-between ${
                  isActive
                    ? "text-white"
                    : ""
                }`}
              >
                <span>
                  {item.label}.
                </span>

                <span
                  className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_14px_rgba(103,232,249,0.7)] transition duration-300 ${
                    isActive
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                />
              </a>
            );
          })}

          <a
            href="#contact"
            onClick={() =>
              handleNavigationClick("contact")
            }
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