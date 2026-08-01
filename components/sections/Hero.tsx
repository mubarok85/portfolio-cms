"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import HeroCard from "../HeroCard";
import MagneticLink from "../MagneticLink";
import Reveal from "../Reveal";
import Spotlight from "../Spotlight";

type HeroData = {
  badge_text: string;
  title: string;
  highlighted_title: string;
  description: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  resume_url: string | null;
  profile_image_url: string | null;
  clients_supported: number;
  countries_reached: number;
  years_experience: number;
  is_available: boolean;
};

const defaultHeroData: HeroData = {
  badge_text: "Available for new partnerships",
  title: "Helping Businesses",
  highlighted_title: "Grow Through Strategic Sales.",
  description:
    "Senior Sales Executive specializing in international client communication, business development, requirement analysis, and tailored digital solutions for companies worldwide.",
  primary_button_text: "Hire Me",
  primary_button_url: "#contact",
  secondary_button_text: "Download Resume",
  resume_url: "/resume.pdf",
  profile_image_url: "/profile.webp",
  clients_supported: 500,
  countries_reached: 50,
  years_experience: 4,
  is_available: true,
};

export default function Hero() {
  const [heroData, setHeroData] =
    useState<HeroData>(defaultHeroData);

  useEffect(() => {
    async function loadHeroData() {
      try {
        const response = await fetch("/api/hero", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.ok && result.success && result.data) {
          setHeroData({
            badge_text:
              result.data.badge_text ||
              defaultHeroData.badge_text,

            title:
              result.data.title ||
              defaultHeroData.title,

            highlighted_title:
              result.data.highlighted_title ||
              defaultHeroData.highlighted_title,

            description:
              result.data.description ||
              defaultHeroData.description,

            primary_button_text:
              result.data.primary_button_text ||
              defaultHeroData.primary_button_text,

            primary_button_url:
              result.data.primary_button_url ||
              defaultHeroData.primary_button_url,

            secondary_button_text:
              result.data.secondary_button_text ||
              defaultHeroData.secondary_button_text,

            resume_url:
              result.data.resume_url ||
              defaultHeroData.resume_url,

            profile_image_url:
              result.data.profile_image_url ||
              defaultHeroData.profile_image_url,

            clients_supported:
              Number(result.data.clients_supported) ||
              defaultHeroData.clients_supported,

            countries_reached:
              Number(result.data.countries_reached) ||
              defaultHeroData.countries_reached,

            years_experience:
              Number(result.data.years_experience) ||
              defaultHeroData.years_experience,

            is_available:
              typeof result.data.is_available === "boolean"
                ? result.data.is_available
                : defaultHeroData.is_available,
          });
        }
      } catch {
        setHeroData(defaultHeroData);
      }
    }

    loadHeroData();
  }, []);

  const stats = [
    {
      end: heroData.clients_supported,
      suffix: "+",
      label: "Clients Supported",
    },
    {
      end: heroData.countries_reached,
      suffix: "+",
      label: "Countries Reached",
    },
    {
      end: heroData.years_experience,
      suffix: "+",
      label: "Years of Experience",
    },
  ];

  return (
    <Spotlight className="hero-section section-atmosphere">
      <section
        id="home"
        className="relative w-full overflow-hidden px-5 pb-20 pt-28 text-white sm:px-6 sm:pt-32 md:pb-28 md:pt-40"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-220px] top-[30px] h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px] sm:left-[-140px] sm:h-[480px] sm:w-[480px]" />

          <div className="absolute right-[-240px] top-[80px] h-[430px] w-[430px] rounded-full bg-violet-600/15 blur-[130px] sm:right-[-120px] sm:h-[500px] sm:w-[500px]" />

          <div className="pulse-orbit absolute left-[10%] top-[28%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.95)]" />

          <div className="pulse-orbit absolute right-[12%] top-[24%] h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.95)]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl min-w-0 items-center gap-14 lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="relative z-10 min-w-0">
            <Reveal>
              {heroData.is_available && (
                <div className="section-label mb-6 max-w-full text-[10px] tracking-[0.12em] sm:mb-7 sm:text-xs">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
                  </span>

                  <span className="min-w-0 break-words">
                    {heroData.badge_text}.
                  </span>
                </div>
              )}
            </Reveal>

            <Reveal delay={100}>
              <h1 className="max-w-full break-words text-[42px] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-7xl xl:text-[84px]">
                {heroData.title}{" "}
                <span className="text-gradient">
                  {heroData.highlighted_title}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl break-words text-sm leading-7 text-slate-400 sm:mt-7 sm:text-base md:text-lg md:leading-8">
                {heroData.description}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 grid w-full gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                <MagneticLink
                  href={heroData.primary_button_url}
                  className="premium-button inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-semibold text-white sm:w-auto sm:px-8 sm:text-base"
                >
                  {heroData.primary_button_text}.
                  <span aria-hidden="true">→</span>
                </MagneticLink>

                <MagneticLink
                  href={heroData.resume_url || "/resume.pdf"}
                  download
                  className="secondary-button inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-semibold text-white sm:w-auto sm:px-8 sm:text-base"
                >
                  {heroData.secondary_button_text}.
                  <span aria-hidden="true">↓</span>
                </MagneticLink>
              </div>
            </Reveal>

            <div className="mt-10 grid w-full gap-4 sm:mt-12 sm:grid-cols-3">
              {stats.map((item, index) => (
                <Reveal
                  key={item.label}
                  delay={400 + index * 100}
                >
                  <div className="premium-card animated-card flex min-h-[150px] w-full flex-col items-center justify-center rounded-3xl px-5 py-6 text-center">
                    <p className="whitespace-nowrap text-4xl font-extrabold text-white">
                      <CountUp
                        key={`${item.label}-${item.end}`}
                        end={item.end}
                        duration={2.5}
                        enableScrollSpy
                        scrollSpyOnce
                      />

                      {item.suffix}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.label}.
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal direction="scale" delay={250}>
            <HeroCard
              imageUrl={heroData.profile_image_url}
              countriesReached={
                heroData.countries_reached
              }
              isAvailable={heroData.is_available}
            />
          </Reveal>
        </div>

        <a
          href="#about"
          aria-label="Scroll to About section"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500 transition-colors duration-300 hover:text-white md:flex"
        >
          <span>Scroll.</span>

          <span className="relative h-10 w-px overflow-hidden bg-white/10">
            <span className="hero-scroll-line absolute left-0 top-0 h-5 w-px bg-gradient-to-b from-blue-400 to-violet-400" />
          </span>
        </a>
      </section>
    </Spotlight>
  );
}