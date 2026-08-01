"use client";

import { useEffect, useState } from "react";

const navigationItems = [
  { label: "About", href: "#about", id: "about" },
  { label: "Services", href: "#services", id: "services" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 30);

      const sections = navigationItems
        .map((item) => document.getElementById(item.id))
        .filter((section): section is HTMLElement => Boolean(section));

      let currentSection = "";

      sections.forEach((section) => {
        const rectangle = section.getBoundingClientRect();

        if (rectangle.top <= 180 && rectangle.bottom >= 180) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full px-4 transition-all duration-500 md:px-6 ${
        isScrolled ? "pt-3" : "pt-4"
      }`}
    >
      <nav
        className={`premium-navbar mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-500 md:px-6 ${
          isScrolled ? "py-2.5 shadow-2xl" : "py-3"
        }`}
      >
        <a
          href="#home"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <span className="logo-box">
            <span>MH.</span>
          </span>

          <div>
            <p className="text-lg font-extrabold tracking-[-0.04em] text-white">
              Mobarok.
            </p>

            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
              Sales Executive.
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                className={`nav-link ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : ""
                }`}
              >
                {item.label}.

                <span
                  className={`absolute bottom-1.5 left-1/2 h-px -translate-x-1/2 bg-gradient-to-r from-blue-400 to-violet-400 transition-all duration-300 ${
                    isActive ? "w-8" : "w-0"
                  }`}
                />
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#contact"
            className="px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            Let&apos;s Talk.
          </a>

          <a
            href="#contact"
            className="premium-button inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-bold text-white"
          >
            Hire Me.
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu."
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="menu-button lg:hidden"
        >
          <span
            className={`menu-line ${
              isMenuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />

          <span
            className={`menu-line ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />

          <span
            className={`menu-line ${
              isMenuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`mx-auto max-w-7xl overflow-hidden transition-all duration-500 lg:hidden ${
          isMenuOpen
            ? "mt-3 max-h-[520px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mobile-menu">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={closeMenu}
              className={`mobile-link ${
                activeSection === item.id
                  ? "bg-white/[0.07] text-white"
                  : ""
              }`}
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
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}