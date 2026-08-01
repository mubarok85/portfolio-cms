"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Experience = {
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

type ExperienceForm = {
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

const emptyForm: ExperienceForm = {
  role: "",
  company: "",
  period: "",
  description: "",
  skills: "",
  icon: "briefcase",
  sort_order: 0,
  is_active: true,
};

const iconOptions = [
  {
    value: "trending",
    label: "Trending.",
  },
  {
    value: "briefcase",
    label: "Briefcase.",
  },
  {
    value: "award",
    label: "Award.",
  },
];

export default function ExperienceEditor() {
  const [items, setItems] = useState<Experience[]>([]);
  const [formData, setFormData] =
    useState<ExperienceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const loadExperience = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch("/api/experience", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load experience.",
        );
      }

      setItems(result.data ?? []);
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load experience.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  function updateField<K extends keyof ExperienceForm>(
    field: K,
    value: ExperienceForm[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(item: Experience) {
    setEditingId(item.id);

    setFormData({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      skills: (item.skills || []).join(", "),
      icon: item.icon,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });

    setMessage("");
    setHasError(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("");
    setHasError(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setHasError(false);

    try {
      const skills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await fetch("/api/experience", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          skills,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save experience.",
        );
      }

      setMessage(
        editingId
          ? "Experience updated successfully."
          : "Experience created successfully.",
      );

      setEditingId(null);
      setFormData(emptyForm);

      await loadExperience();
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save experience.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch("/api/experience", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete experience.",
        );
      }

      setMessage("Experience deleted successfully.");

      if (editingId === id) {
        cancelEditing();
      }

      await loadExperience();
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete experience.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {editingId
                ? "Edit Experience."
                : "Add Experience."}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage your professional roles and experience.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Cancel Editing.
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Role.
            </label>

            <input
              type="text"
              required
              value={formData.role}
              onChange={(event) =>
                updateField("role", event.target.value)
              }
              placeholder="Senior Sales Executive."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Company.
            </label>

            <input
              type="text"
              required
              value={formData.company}
              onChange={(event) =>
                updateField("company", event.target.value)
              }
              placeholder="Company name."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Period.
            </label>

            <input
              type="text"
              required
              value={formData.period}
              onChange={(event) =>
                updateField("period", event.target.value)
              }
              placeholder="2022 — Present."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Icon.
            </label>

            <select
              value={formData.icon}
              onChange={(event) =>
                updateField("icon", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-[#090d1d] px-5 py-4 outline-none focus:border-blue-400/50"
            >
              {iconOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Description.
            </label>

            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Describe this professional role."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Skills, separated by commas.
            </label>

            <textarea
              rows={3}
              value={formData.skills}
              onChange={(event) =>
                updateField("skills", event.target.value)
              }
              placeholder="International Sales, Negotiation, Client Management."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Display Order.
            </label>

            <input
              type="number"
              min={0}
              value={formData.sort_order}
              onChange={(event) =>
                updateField(
                  "sort_order",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(event) =>
                updateField("is_active", event.target.checked)
              }
              className="h-5 w-5"
            />

            <div>
              <p className="font-semibold">
                Active Experience.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Display this role on the public website.
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="premium-button mt-8 inline-flex w-full items-center justify-center rounded-2xl px-7 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {isSaving
            ? "Saving..."
            : editingId
              ? "Update Experience"
              : "Add Experience"}
        </button>
      </form>

      {message && (
        <p
          className={`rounded-2xl border px-5 py-4 text-sm ${
            hasError
              ? "border-red-400/20 bg-red-400/10 text-red-200"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          }`}
        >
          {message}
        </p>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Existing Experience.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {items.length} experience entries.
            </p>
          </div>

          <button
            type="button"
            onClick={loadExperience}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Refresh.
          </button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-slate-400">
            Loading experience.
          </p>
        ) : items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 text-slate-400">
            No experience has been created.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold">
                        {item.role}.
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          item.is_active
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            : "border-slate-400/20 bg-slate-400/10 text-slate-300"
                        }`}
                      >
                        {item.is_active ? "Active." : "Hidden."}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                        Order {item.sort_order}.
                      </span>
                    </div>

                    <p className="mt-2 font-medium text-amber-200">
                      {item.company}, {item.period}.
                    </p>

                    <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                      {item.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(item.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          {skill}.
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-400/20"
                    >
                      Edit.
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete."}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}