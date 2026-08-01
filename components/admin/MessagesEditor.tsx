"use client";

import { useCallback, useEffect, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesEditor() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notice, setNotice] = useState("");
  const [hasError, setHasError] = useState(false);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setNotice("");
    setHasError(false);

    try {
      const response = await fetch("/api/messages", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load messages.");
      }

      setMessages(result.data ?? []);
    } catch (error) {
      setHasError(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to load messages.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function updateReadStatus(
    message: ContactMessage,
    isRead: boolean,
  ) {
    setUpdatingId(message.id);
    setNotice("");
    setHasError(false);

    try {
      const response = await fetch("/api/messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: message.id,
          is_read: isRead,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update message.");
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                is_read: isRead,
              }
            : item,
        ),
      );

      setNotice(
        isRead
          ? "Message marked as read."
          : "Message marked as unread.",
      );
    } catch (error) {
      setHasError(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to update message.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setNotice("");
    setHasError(false);

    try {
      const response = await fetch("/api/messages", {
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
        throw new Error(result.message || "Unable to delete message.");
      }

      setMessages((current) =>
        current.filter((message) => message.id !== id),
      );

      setNotice("Message deleted successfully.");
    } catch (error) {
      setHasError(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to delete message.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const unreadCount = messages.filter(
    (message) => !message.is_read,
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Total Messages.
          </p>

          <p className="mt-3 text-4xl font-bold">
            {messages.length}.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-6">
          <p className="text-sm text-blue-200">
            Unread Messages.
          </p>

          <p className="mt-3 text-4xl font-bold text-blue-100">
            {unreadCount}.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-sm text-emerald-200">
            Read Messages.
          </p>

          <p className="mt-3 text-4xl font-bold text-emerald-100">
            {messages.length - unreadCount}.
          </p>
        </div>
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

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Contact Inbox.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Review messages submitted from your portfolio.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMessages}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Refresh.
          </button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-slate-400">
            Loading messages.
          </p>
        ) : messages.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 text-slate-400">
            No contact messages have been received.
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-3xl border p-6 ${
                  message.is_read
                    ? "border-white/10 bg-black/20"
                    : "border-blue-400/25 bg-blue-400/[0.08]"
                }`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold">
                        {message.subject}.
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          message.is_read
                            ? "border-slate-400/20 bg-slate-400/10 text-slate-300"
                            : "border-blue-400/20 bg-blue-400/10 text-blue-200"
                        }`}
                      >
                        {message.is_read ? "Read." : "Unread."}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      From{" "}
                      <span className="font-semibold text-white">
                        {message.name}.
                      </span>
                    </p>

                    <a
                      href={`mailto:${message.email}`}
                      className="mt-1 inline-block text-sm text-blue-300 transition hover:text-blue-200"
                    >
                      {message.email}
                    </a>

                    <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-300">
                      {message.message}
                    </p>

                    <p className="mt-5 text-xs text-slate-500">
                      {new Date(message.created_at).toLocaleString()}.
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        `Re: ${message.subject}`,
                      )}`}
                      className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/20"
                    >
                      Reply.
                    </a>

                    <button
                      type="button"
                      disabled={updatingId === message.id}
                      onClick={() =>
                        updateReadStatus(
                          message,
                          !message.is_read,
                        )
                      }
                      className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-400/20 disabled:opacity-60"
                    >
                      {updatingId === message.id
                        ? "Updating..."
                        : message.is_read
                          ? "Mark Unread."
                          : "Mark Read."}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === message.id}
                      onClick={() => deleteMessage(message.id)}
                      className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
                    >
                      {deletingId === message.id
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