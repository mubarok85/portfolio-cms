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

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
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
        className="relative overflow-hidden px-6 pb-24 pt-40 text-white md:pb-32 md:pt-44"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-140px] top-[40px] h-[480px] w-[480px] rounded-full bg-blue-600/15 blur-[140px]" />

          <div className="absolute right-[-120px] top-[60px] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[150px]" />

          <div className="pulse-orbit absolute left-[12%] top-[28%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.95)]" />

          <div className="pulse-orbit absolute right-[17%] top-[24%] h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.95)]" />

          <div className="absolute left-1/2 top-[35%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10">
            <Reveal>
              <div className="section-label mb-7">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
                </span>

                {heroData.badge_text}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] md:text-7xl xl:text-[84px]">
                {heroData.title}{" "}
                <span className="text-gradient">
                  {heroData.highlighted_title}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
                {heroData.description}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticLink
                  href={heroData.primary_button_url}
                  className="premium-button inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-semibold text-white"
                >
                  {heroData.primary_button_text}
                  <span aria-hidden="true">→</span>
                </MagneticLink>

                <MagneticLink
                  href={
                    heroData.resume_url ||
                    "/resume.pdf"
                  }
                  download
                  className="secondary-button inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-semibold text-white"
                >
                  {heroData.secondary_button_text}
                  <span aria-hidden="true">↓</span>
                </MagneticLink>
              </div>
            </Reveal>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              {stats.map((item, index) => (
                <Reveal
                  key={item.label}
                  delay={400 + index * 100}
                >
                  <div className="premium-card animated-card h-full rounded-3xl px-5 py-6 text-center">
                    <p className="text-4xl font-extrabold text-white">
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
                      {item.label}
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
          <span>Scroll</span>

          <span className="relative h-10 w-px overflow-hidden bg-white/10">
            <span className="hero-scroll-line absolute left-0 top-0 h-5 w-px bg-gradient-to-b from-blue-400 to-violet-400" />
          </span>
        </a>
      </section>
    </Spotlight>
  );
}