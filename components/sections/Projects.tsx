"use client";

import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiLayers,
  FiMonitor,
  FiSmartphone,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import Reveal from "../Reveal";
import SectionHeading from "../ui/SectionHeading";

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  outcome: string | null;
  image_url: string | null;
  live_url: string | null;
  source_url: string | null;
  icon: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

const iconMap: Record<string, IconType> = {
  monitor: FiMonitor,
  smartphone: FiSmartphone,
  layers: FiLayers,
};

const defaultProjects: Project[] = [
  {
    id: "default-1",
    title: "Mobile Application Consultation",
    category: "Sales Strategy",
    description:
      "Defined the project scope, user roles, milestones, budget, technical direction, and delivery strategy.",
    outcome:
      "Clear scope and milestone-based execution plan.",
    image_url: null,
    live_url: null,
    source_url: null,
    icon: "smartphone",
    sort_order: 1,
    is_featured: true,
    is_active: true,
  },
  {
    id: "default-2",
    title: "Business Website Project",
    category: "Client Communication",
    description:
      "Managed requirement discovery, proposal preparation, design coordination, project updates, and communication.",
    outcome:
      "Aligned communication and efficient delivery.",
    image_url: null,
    live_url: null,
    source_url: null,
    icon: "monitor",
    sort_order: 2,
    is_featured: true,
    is_active: true,
  },
  {
    id: "default-3",
    title: "AI Automation Solution",
    category: "Business Development",
    description:
      "Structured the workflow, identified automation opportunities, and recommended a scalable technical approach.",
    outcome:
      "Practical roadmap for scalable automation.",
    image_url: null,
    live_url: null,
    source_url: null,
    icon: "layers",
    sort_order: 3,
    is_featured: true,
    is_active: true,
  },
];

export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>(defaultProjects);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", {
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setProjects(
            result.data.filter(
              (project: Project) => project.is_active,
            ),
          );
        }
      } catch {
        setProjects(defaultProjects);
      }
    }

    loadProjects();
  }, []);

  return (
    <section
      id="projects"
      className="projects-section section-atmosphere relative overflow-hidden px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            badge="Projects"
            title="Selected work and"
            highlight="client partnerships."
            description="A selection of projects where I supported clients through consultation, planning, communication, and business development."
          />

          <a
            href="#contact"
            className="secondary-button inline-flex w-fit items-center gap-3 rounded-full px-7 py-4 font-semibold text-white"
          >
            Start a Project.
            <FiArrowUpRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {projects.map((project, index) => {
            const Icon =
              iconMap[project.icon] || FiMonitor;

            return (
              <Reveal
                key={project.id}
                delay={index * 140}
                direction="up"
              >
                <article className="premium-card animated-card group h-full overflow-hidden rounded-3xl">
                  <div className="relative flex h-64 items-center justify-center overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-violet-500/10 to-transparent" />

                    <div className="pulse-orbit absolute h-48 w-48 rounded-full border border-white/10" />

                    <div className="pulse-orbit absolute h-36 w-36 rounded-full border border-pink-300/20" />

                    <div className="absolute h-24 w-24 rounded-full bg-pink-400/10 blur-2xl" />

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-pink-200 shadow-2xl backdrop-blur-xl transition duration-500 group-hover:scale-110">
                      <Icon className="h-8 w-8" />
                    </div>

                    <span className="absolute bottom-5 right-6 text-6xl font-bold text-white/[0.06]">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                  </div>

                  <div className="p-8">
                    <p className="accent-text text-sm font-bold uppercase tracking-[0.15em]">
                      {project.category}.
                    </p>

                    <h3 className="mt-4 text-2xl font-bold text-white">
                      {project.title}.
                    </h3>

                    <p className="mt-4 leading-7 text-slate-400">
                      {project.description}
                    </p>

                    {project.outcome && (
                      <div className="mt-7 border-t border-white/10 pt-6">
                        <p className="text-sm text-slate-500">
                          Project outcome.
                        </p>

                        <p className="mt-2 font-medium leading-7 text-slate-300">
                          {project.outcome}.
                        </p>
                      </div>
                    )}

                    <div className="mt-7 flex flex-wrap gap-4">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="accent-text inline-flex items-center gap-2 font-semibold transition hover:text-white"
                        >
                          View Project.
                          <FiArrowUpRight className="h-5 w-5" />
                        </a>
                      )}

                      {project.source_url && (
                        <a
                          href={project.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 transition hover:text-white"
                        >
                          Source Code.
                        </a>
                      )}
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