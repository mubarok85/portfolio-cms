"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

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

type ProjectForm = {
  title: string;
  category: string;
  description: string;
  outcome: string;
  image_url: string;
  live_url: string;
  source_url: string;
  icon: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

const emptyForm: ProjectForm = {
  title: "",
  category: "",
  description: "",
  outcome: "",
  image_url: "",
  live_url: "",
  source_url: "",
  icon: "monitor",
  sort_order: 0,
  is_featured: true,
  is_active: true,
};

const iconOptions = [
  {
    value: "monitor",
    label: "Monitor.",
  },
  {
    value: "smartphone",
    label: "Smartphone.",
  },
  {
    value: "layers",
    label: "Layers.",
  },
];

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load projects.",
        );
      }

      setProjects(result.data ?? []);
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load projects.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(project: Project) {
    setEditingId(project.id);

    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      outcome: project.outcome || "",
      image_url: project.image_url || "",
      live_url: project.live_url || "",
      source_url: project.source_url || "",
      icon: project.icon,
      sort_order: project.sort_order,
      is_featured: project.is_featured,
      is_active: project.is_active,
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
      const response = await fetch("/api/projects", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save project.",
        );
      }

      setMessage(
        editingId
          ? "Project updated successfully."
          : "Project created successfully.",
      );

      setEditingId(null);
      setFormData(emptyForm);

      await loadProjects();
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save project.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");
    setHasError(false);

    try {
      const response = await fetch("/api/projects", {
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
          result.message || "Unable to delete project.",
        );
      }

      setMessage("Project deleted successfully.");

      if (editingId === id) {
        cancelEditing();
      }

      await loadProjects();
    } catch (error) {
      setHasError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete project.",
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
              {editingId ? "Edit Project." : "Add Project."}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage project details, links, visibility, and display order.
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
              Project Title.
            </label>

            <input
              type="text"
              required
              value={formData.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Category.
            </label>

            <input
              type="text"
              required
              value={formData.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
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
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Outcome.
            </label>

            <textarea
              rows={3}
              value={formData.outcome}
              onChange={(event) =>
                updateField("outcome", event.target.value)
              }
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-sm text-slate-300">
              Image URL.
            </label>

            <input
              type="text"
              value={formData.image_url}
              onChange={(event) =>
                updateField("image_url", event.target.value)
              }
              placeholder="/project-image.webp"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Live Project URL.
            </label>

            <input
              type="url"
              value={formData.live_url}
              onChange={(event) =>
                updateField("live_url", event.target.value)
              }
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-slate-300">
              Source URL.
            </label>

            <input
              type="url"
              value={formData.source_url}
              onChange={(event) =>
                updateField("source_url", event.target.value)
              }
              placeholder="https://github.com/example"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(event) =>
                updateField("is_featured", event.target.checked)
              }
              className="h-5 w-5"
            />

            <div>
              <p className="font-semibold">
                Featured Project.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Highlight this project on the website.
              </p>
            </div>
          </label>

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
                Active Project.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Display this project on the public website.
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
              ? "Update Project"
              : "Add Project"}
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
              Existing Projects.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {projects.length} project entries.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProjects}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Refresh.
          </button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-slate-400">
            Loading projects.
          </p>
        ) : projects.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 text-slate-400">
            No projects have been created.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold">
                        {project.title}.
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          project.is_active
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            : "border-slate-400/20 bg-slate-400/10 text-slate-300"
                        }`}
                      >
                        {project.is_active ? "Active." : "Hidden."}
                      </span>

                      {project.is_featured && (
                        <span className="rounded-full border border-pink-400/20 bg-pink-400/10 px-3 py-1 text-xs text-pink-200">
                          Featured.
                        </span>
                      )}

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                        Order {project.sort_order}.
                      </span>
                    </div>

                    <p className="mt-2 font-medium text-pink-200">
                      {project.category}.
                    </p>

                    <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(project)}
                      className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-400/20"
                    >
                      Edit.
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project.id)}
                      className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
                    >
                      {deletingId === project.id
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