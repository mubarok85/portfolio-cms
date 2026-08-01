"use client";

import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiBriefcase,
  FiGlobe,
  FiMessageCircle,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import Reveal from "../Reveal";
import SectionHeading from "../ui/SectionHeading";

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

const iconMap: Record<string, IconType> = {
  globe: FiGlobe,
  message: FiMessageCircle,
  chart: FiBarChart2,
  search: FiSearch,
  briefcase: FiBriefcase,
  users: FiUsers,
};

const defaultServices: Service[] = [
  {
    id: "default-1",
    title: "International Sales",
    description:
      "Helping businesses connect with global clients, qualify opportunities, and move conversations toward successful partnerships.",
    icon: "globe",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "default-2",
    title: "Client Communication",
    description:
      "Managing professional meetings, follow-ups, requirement discussions, updates, and long-term international relationships.",
    icon: "message",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "default-3",
    title: "Business Development",
    description:
      "Identifying growth opportunities and positioning the most suitable digital solution for each business requirement.",
    icon: "chart",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "default-4",
    title: "Requirement Analysis",
    description:
      "Turning client ideas into clear features, milestones, timelines, budgets, and practical project scopes.",
    icon: "search",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "default-5",
    title: "Digital Consultation",
    description:
      "Providing guidance for websites, mobile applications, branding, automation, software, and scalable digital products.",
    icon: "briefcase",
    sort_order: 5,
    is_active: true,
  },
  {
    id: "default-6",
    title: "Project Coordination",
    description:
      "Maintaining clear communication between clients, designers, developers, and project managers throughout delivery.",
    icon: "users",
    sort_order: 6,
    is_active: true,
  },
];

export default function Services() {
  const [services, setServices] =
    useState<Service[]>(defaultServices);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch("/api/services", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          setServices(
            result.data.filter(
              (service: Service) => service.is_active,
            ),
          );
        }
      } catch {
        setServices(defaultServices);
      }
    }

    loadServices();
  }, []);

  return (
    <section
      id="services"
      className="services-section section-atmosphere relative overflow-hidden px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          badge="Services"
          title="Strategic support for"
          highlight="modern businesses."
          description="I help businesses understand opportunities, communicate professionally, define requirements, and build stronger international partnerships."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || FiGlobe;

            return (
              <Reveal
                key={service.id}
                delay={index * 100}
                direction="up"
              >
                <article className="premium-card animated-card group h-full rounded-3xl p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-400/10 text-emerald-200">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="accent-text text-sm font-bold tracking-[0.16em]">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                  </div>

                  <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <h3 className="mt-8 text-2xl font-bold text-white">
                    {service.title}.
                  </h3>

                  <p className="mt-4 leading-7 text-slate-400">
                    {service.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Professional service.
                    </span>

                    <span className="accent-text text-2xl transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
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