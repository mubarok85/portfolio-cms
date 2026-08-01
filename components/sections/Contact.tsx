"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  FiClock,
  FiMail,
  FiMapPin,
  FiSend,
} from "react-icons/fi";
import Reveal from "../Reveal";
import SectionHeading from "../ui/SectionHeading";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SettingsData = {
  email: string | null;
  phone: string | null;
  location: string;
  availability_text: string;
};

const emptyForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const defaultSettings: SettingsData = {
  email: "your@email.com",
  phone: null,
  location: "Dhaka, Bangladesh",
  availability_text: "Open for international opportunities",
};

export default function Contact() {
  const [formData, setFormData] =
    useState<ContactForm>(emptyForm);

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          setSettings({
            email:
              result.data.email ||
              defaultSettings.email,
            phone:
              result.data.phone ||
              defaultSettings.phone,
            location:
              result.data.location ||
              defaultSettings.location,
            availability_text:
              result.data.availability_text ||
              defaultSettings.availability_text,
          });
        }
      } catch {
        setSettings(defaultSettings);
      }
    }

    loadSettings();
  }, []);

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSending(true);
    setNotice("");
    setHasError(false);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send message.",
        );
      }

      setFormData(emptyForm);
      setNotice("Your message was sent successfully.");
    } catch (error) {
      setHasError(true);

      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  const contactItems = [
    {
      icon: FiMail,
      label: "Email",
      value: settings.email || "Not provided",
      href: settings.email
        ? `mailto:${settings.email}`
        : undefined,
    },
    {
      icon: FiMapPin,
      label: "Location",
      value: settings.location,
      href: undefined,
    },
    {
      icon: FiClock,
      label: "Availability",
      value: settings.availability_text,
      href: undefined,
    },
  ];

  return (
    <section
      id="contact"
      className="contact-section section-atmosphere relative overflow-hidden px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          badge="Contact"
          title="Let&apos;s build something"
          highlight="meaningful together."
          description="Share your project, partnership, or business opportunity, and I will respond with a clear and professional approach."
        />

        <div className="premium-card mt-16 overflow-hidden rounded-[36px]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-white/10 p-8 md:p-12 lg:border-b-0 lg:border-r">
              <Reveal direction="left">
                <h3 className="text-3xl font-bold text-white">
                  Start a conversation.
                </h3>

                <p className="mt-5 max-w-xl leading-8 text-slate-400">
                  Whether you need sales consultation, client communication
                  support, project planning, or business development, send a
                  message and I will get back to you.
                </p>
              </Reveal>

              <div className="mt-10 space-y-4">
                {contactItems.map((item, index) => {
                  const Icon = item.icon;

                  const content = (
                    <div className="animated-card rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm text-slate-500">
                            {item.label}.
                          </p>

                          <p className="mt-1 break-words font-semibold text-white">
                            {item.value}.
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <Reveal
                      key={item.label}
                      delay={index * 100}
                      direction="left"
                    >
                      {item.href ? (
                        <a href={item.href}>
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </Reveal>
                  );
                })}
              </div>

              {settings.phone && (
                <Reveal delay={300} direction="left">
                  <a
                    href={`tel:${settings.phone}`}
                    className="mt-4 block rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
                  >
                    <p className="text-sm text-slate-500">
                      Phone.
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {settings.phone}.
                    </p>
                  </a>
                </Reveal>
              )}
            </div>

            <div className="p-8 md:p-12">
              <Reveal direction="right">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-3 block text-sm font-medium text-slate-300"
                      >
                        Full Name.
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        value={formData.name}
                        onChange={(event) =>
                          updateField(
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="Enter your name."
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-3 block text-sm font-medium text-slate-300"
                      >
                        Email Address.
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={254}
                        value={formData.email}
                        onChange={(event) =>
                          updateField(
                            "email",
                            event.target.value,
                          )
                        }
                        placeholder="Enter your email."
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="mb-3 block text-sm font-medium text-slate-300"
                    >
                      Subject.
                    </label>

                    <input
                      id="contact-subject"
                      type="text"
                      required
                      minLength={2}
                      maxLength={200}
                      value={formData.subject}
                      onChange={(event) =>
                        updateField(
                          "subject",
                          event.target.value,
                        )
                      }
                      placeholder="What would you like to discuss."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-3 block text-sm font-medium text-slate-300"
                    >
                      Message.
                    </label>

                    <textarea
                      id="contact-message"
                      rows={7}
                      required
                      minLength={5}
                      maxLength={5000}
                      value={formData.message}
                      onChange={(event) =>
                        updateField(
                          "message",
                          event.target.value,
                        )
                      }
                      placeholder="Tell me about your project or opportunity."
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                    />
                  </div>

                  {notice && (
                    <p
                      className={`rounded-2xl border px-5 py-4 text-sm ${
                        hasError
                          ? "border-red-400/20 bg-red-400/10 text-red-200"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      }`}
                    >
                      {notice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="premium-button inline-flex w-full items-center justify-center gap-3 rounded-2xl px-7 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending
                      ? "Sending..."
                      : "Send Message"}

                    <FiSend className="h-5 w-5" />
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    I usually respond within 24 hours.
                  </p>
                </form>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}