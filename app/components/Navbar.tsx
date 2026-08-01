"use client";

import { useState } from "react";

const navigationItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4 md:px-6">
      <nav className="premium-navbar mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <a
          href="#"
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
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
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
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}