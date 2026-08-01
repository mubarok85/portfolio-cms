"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    label: "Hero Section",
    href: "/admin/hero",
  },
  {
    label: "About Section",
    href: "/admin/about",
  },
  {
    label: "Services",
    href: "/admin/services",
  },
  {
    label: "Experience",
    href: "/admin/experience",
  },
  {
    label: "Projects",
    href: "/admin/projects",
  },
  {
    label: "Contact Messages",
    href: "/admin/messages",
  },
  {
    label: "Settings",
    href: "/admin/settings",
  },
];

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export default function AdminShell({
  children,
  title,
  description,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#070b1d] p-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="text-2xl font-bold text-blue-400"
            >
              Portfolio Admin.
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg border border-white/10 px-3 py-2 lg:hidden"
            >
              ×
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-blue-500/15 text-blue-300"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}.
                </Link>
              );
            })}
          </nav>
        </aside>

        {isMenuOpen && (
          <button
            type="button"
            aria-label="Close admin menu."
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        <section className="min-w-0 flex-1 p-6 md:p-10">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="mb-5 rounded-xl border border-white/10 px-4 py-2 lg:hidden"
              >
                Open Menu.
              </button>

              <p className="text-sm text-blue-400">
                Admin Panel.
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {title}.
              </h1>

              {description && (
                <p className="mt-3 max-w-2xl leading-7 text-gray-400">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="shrink-0 rounded-xl border border-white/10 px-5 py-3 text-sm transition hover:bg-white/10 disabled:opacity-60"
            >
              {isLoggingOut ? "Logging Out..." : "Log Out."}
            </button>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}