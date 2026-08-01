import Link from "next/link";
import AdminShell from "../../../components/admin/AdminShell";
import { createClient } from "../../../lib/supabase/server";

type RecentMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  is_read: boolean;
  created_at: string;
};

type DashboardData = {
  projects: number;
  services: number;
  experience: number;
  messages: number;
  unreadMessages: number;
  recentMessages: RecentMessage[];
};

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [
    projectsResult,
    servicesResult,
    experienceResult,
    messagesResult,
    unreadMessagesResult,
    recentMessagesResult,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("services")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("experience")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("messages")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("is_read", false),

    supabase
      .from("messages")
      .select(
        "id, name, email, subject, is_read, created_at",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  return {
    projects: projectsResult.count ?? 0,
    services: servicesResult.count ?? 0,
    experience: experienceResult.count ?? 0,
    messages: messagesResult.count ?? 0,
    unreadMessages: unreadMessagesResult.count ?? 0,
    recentMessages:
      (recentMessagesResult.data as RecentMessage[] | null) ??
      [],
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const statistics = [
    {
      title: "Projects",
      value: data.projects,
      description: "Portfolio project entries.",
      href: "/admin/projects",
    },
    {
      title: "Services",
      value: data.services,
      description: "Professional service entries.",
      href: "/admin/services",
    },
    {
      title: "Experience",
      value: data.experience,
      description: "Professional experience entries.",
      href: "/admin/experience",
    },
    {
      title: "Messages",
      value: data.messages,
      description: `${data.unreadMessages} unread messages.`,
      href: "/admin/messages",
    },
  ];

  return (
    <AdminShell
      title="Dashboard Overview"
      description="Manage your portfolio content and monitor your website data."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-slate-400">
                {item.title}.
              </p>

              <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-300">
                →
              </span>
            </div>

            <p className="mt-5 text-4xl font-bold text-white">
              {String(item.value).padStart(2, "0")}.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-300">
                Inbox.
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Recent messages.
              </h2>
            </div>

            <Link
              href="/admin/messages"
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              View All.
            </Link>
          </div>

          {data.recentMessages.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
              <p className="text-slate-400">
                No contact messages have been received.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {data.recentMessages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-2xl border p-5 ${
                    message.is_read
                      ? "border-white/10 bg-black/20"
                      : "border-blue-400/25 bg-blue-400/[0.08]"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate font-bold text-white">
                          {message.subject}.
                        </h3>

                        {!message.is_read && (
                          <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-200">
                            Unread.
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {message.name}, {message.email}.
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {formatDate(message.created_at)}.
                      </p>
                    </div>

                    <Link
                      href="/admin/messages"
                      className="shrink-0 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                    >
                      Open.
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-blue-400/20 bg-blue-400/[0.08] p-6 md:p-8">
            <p className="text-sm font-medium text-blue-200">
              Website Status.
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              CMS connected.
            </h2>

            <p className="mt-4 leading-7 text-blue-100/70">
              Your public portfolio loads its content from Supabase, and
              updates made through the admin panel are stored in the database.
            </p>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-xl border border-blue-300/20 bg-blue-300/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20"
            >
              Open Public Website.
            </a>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-sm font-medium text-emerald-300">
              Quick Actions.
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/admin/hero"
                className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Update Hero Section.
              </Link>

              <Link
                href="/admin/projects"
                className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Manage Projects.
              </Link>

              <Link
                href="/admin/settings"
                className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Update Settings.
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}