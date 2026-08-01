"use client";

import { useEffect, useState } from "react";
import {
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import Reveal from "../Reveal";
import SectionHeading from "../ui/SectionHeading";

type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  icon: string;
  sort_order: number;
  is_active: boolean;
};

const iconMap: Record<string, IconType> = {
  trending: FiTrendingUp,
  briefcase: FiBriefcase,
  award: FiAward,
};

const defaultExperience: ExperienceItem[] = [
  {
    id: "default-1",
    period: "2022 — Present",
    role: "Senior Sales Executive",
    company: "Digital Service Company",
    description:
      "Leading international client communication, requirement analysis, proposal preparation, negotiation, and strategic consultation.",
    skills: [
      "International Sales",
      "Negotiation",
      "Client Management",
    ],
    icon: "trending",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "default-2",
    period: "2021 — 2022",
    role: "Business Development Executive",
    company: "Technology Company",
    description:
      "Generated business opportunities, qualified international leads, prepared project scopes, and coordinated delivery expectations.",
    skills: [
      "Lead Generation",
      "Business Strategy",
      "Project Planning",
    ],
    icon: "briefcase",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "default-3",
    period: "2020 — 2021",
    role: "Client Communication Specialist",
    company: "Creative Agency",
    description:
      "Managed client inquiries, meetings, follow-ups, project updates, and professional long-term relationships.",
    skills: [
      "Communication",
      "Follow-Ups",
      "Relationship Management",
    ],
    icon: "award",
    sort_order: 3,
    is_active: true,
  },
];

export default function Experience() {
  const [experiences, setExperiences] =
    useState<ExperienceItem[]>(defaultExperience);

  useEffect(() => {
    async function loadExperience() {
      try {
        const response = await fetch("/api/experience", {
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setExperiences(
            result.data.filter(
              (item: ExperienceItem) => item.is_active,
            ),
          );
        }
      } catch {
        setExperiences(defaultExperience);
      }
    }

    loadExperience();
  }, []);

  return (
    <section
      id="experience"
      className="experience-section section-atmosphere relative overflow-hidden px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          badge="Experience"
          title="A professional journey built around"
          highlight="trust and growth."
          description="My experience combines international sales, client communication, consultation, and digital business development."
        />

        <div className="mx-auto mt-16 max-w-5xl space-y-6">
          {experiences.map((experience, index) => {
            const Icon =
              iconMap[experience.icon] || FiBriefcase;

            return (
              <Reveal
                key={experience.id}
                delay={index * 140}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <article className="premium-card animated-card relative overflow-hidden rounded-3xl p-7 md:p-10">
                  <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-amber-400/5 blur-3xl" />

                  <div className="grid gap-8 md:grid-cols-[150px_1fr]">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-200 shadow-[0_0_28px_rgba(251,191,36,0.14)]">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="accent-text mt-6 text-sm font-bold uppercase tracking-[0.16em]">
                        {experience.period}.
                      </p>

                      <p className="mt-4 text-5xl font-bold text-white/[0.08]">
                        {String(index + 1).padStart(2, "0")}.
                      </p>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white md:text-3xl">
                            {experience.role}.
                          </h3>

                          <p className="accent-text mt-2 font-semibold">
                            {experience.company}.
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                          Professional role.
                        </span>
                      </div>

                      <p className="mt-6 max-w-3xl leading-8 text-slate-400">
                        {experience.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        {(experience.skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="accent-border accent-background inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-slate-300"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                            {skill}.
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}