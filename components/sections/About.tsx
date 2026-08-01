"use client";

import { useEffect, useState } from "react";
import AboutVisual from "../AboutVisual";
import Reveal from "../Reveal";
import SectionHeading from "../ui/SectionHeading";

type AboutData = {
  heading: string;
  paragraph_one: string;
  paragraph_two: string;
  paragraph_three: string;
  skills: string[];
  image_url: string | null;
};

const defaultAboutData: AboutData = {
  heading: "The person behind every partnership.",
  paragraph_one:
    "I am Mobarok Hossain, a Senior Sales Executive and International Client Communication Specialist with more than four years of experience working with businesses and clients across global markets.",
  paragraph_two:
    "My role is to understand business requirements, identify the right digital solutions, and guide clients through clear communication, consultation, negotiation, and project coordination.",
  paragraph_three:
    "I have supported hundreds of clients across more than 50 countries, helping them plan websites, mobile applications, branding, automation, and software solutions while maintaining strong long-term relationships.",
  skills: [
    "International Sales",
    "Client Communication",
    "Business Development",
    "Requirement Analysis",
    "Negotiation",
    "Project Coordination",
    "Proposal Strategy",
    "Digital Consultation",
  ],
  image_url: "/profile.webp",
};

const values = [
  {
    title: "Strategic Communication",
    description:
      "Clear, professional communication that helps clients understand solutions, expectations, and business value.",
  },
  {
    title: "Long-Term Relationships",
    description:
      "Building partnerships based on trust, consistency, transparency, and reliable support.",
  },
  {
    title: "Business-Focused Thinking",
    description:
      "Connecting client requirements with practical digital solutions that support measurable growth.",
  },
];

function splitHeading(heading: string) {
  const words = heading.trim().split(/\s+/);

  if (words.length <= 3) {
    return {
      title: heading,
      highlight: "",
    };
  }

  const splitIndex = Math.max(1, words.length - 2);

  return {
    title: words.slice(0, splitIndex).join(" "),
    highlight: words.slice(splitIndex).join(" "),
  };
}

export default function About() {
  const [aboutData, setAboutData] =
    useState<AboutData>(defaultAboutData);

  useEffect(() => {
    async function loadAbout() {
      try {
        const response = await fetch("/api/about", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          setAboutData({
            heading:
              result.data.heading ||
              defaultAboutData.heading,
            paragraph_one:
              result.data.paragraph_one ||
              defaultAboutData.paragraph_one,
            paragraph_two:
              result.data.paragraph_two ||
              defaultAboutData.paragraph_two,
            paragraph_three:
              result.data.paragraph_three ||
              defaultAboutData.paragraph_three,
            skills:
              Array.isArray(result.data.skills) &&
              result.data.skills.length > 0
                ? result.data.skills
                : defaultAboutData.skills,
            image_url:
              result.data.image_url ||
              defaultAboutData.image_url,
          });
        }
      } catch {
        setAboutData(defaultAboutData);
      }
    }

    loadAbout();
  }, []);

  const headingParts = splitHeading(aboutData.heading);

  return (
    <section
      id="about"
      className="about-section section-atmosphere relative overflow-hidden px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          badge="About Me"
          title={headingParts.title}
          highlight={headingParts.highlight}
          description="I combine international sales experience, client communication, and digital consultation to help businesses move from ideas to successful partnerships."
        />

        <div className="mt-16 grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal direction="left">
            <AboutVisual imageUrl={aboutData.image_url || "/profile.webp"} />
          </Reveal>

          <div>
            <Reveal direction="right">
              <div className="space-y-6 text-base leading-8 text-slate-300 md:text-lg">
                <p>{aboutData.paragraph_one}</p>

                <p>{aboutData.paragraph_two}</p>

                <p>{aboutData.paragraph_three}</p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {values.map((item, index) => (
                <Reveal key={item.title} delay={index * 120}>
                  <article className="premium-card animated-card h-full rounded-3xl p-6">
                    <p className="accent-text text-sm font-bold uppercase tracking-[0.14em]">
                      0{index + 1}.
                    </p>

                    <h3 className="mt-5 text-xl font-bold text-white">
                      {item.title}.
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <div className="premium-card mt-10 rounded-3xl p-7">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="accent-text text-sm font-bold uppercase tracking-[0.14em]">
                      Core Expertise.
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-white">
                      Skills that support every client engagement.
                    </h3>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                    International experience.
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {aboutData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="accent-border accent-background rounded-full border px-4 py-2 text-sm text-slate-300"
                    >
                      {skill}.
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}