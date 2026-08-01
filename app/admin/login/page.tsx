"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setMessage("Login succeeded, but no session was created.");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while signing in.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20 text-white">
      <div className="premium-card w-full max-w-md rounded-[32px] p-8 md:p-10">
        <div className="text-center">
          <div className="section-label">Admin Access.</div>

          <h1 className="mt-6 text-3xl font-bold">
            Welcome back.
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Sign in to manage your portfolio.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-3 block text-sm font-medium text-slate-300"
            >
              Email address.
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your admin email."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-sm font-medium text-slate-300"
            >
              Password.
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition placeholder:text-slate-600 focus:border-blue-400/50"
            />
          </div>

          {message && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="premium-button inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}