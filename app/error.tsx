"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#03050d] px-6 text-white">
      <div className="premium-card w-full max-w-xl rounded-[32px] p-8 text-center md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">
          Something went wrong.
        </p>

        <h1 className="mt-5 text-3xl font-bold md:text-4xl">
          The page could not be loaded.
        </h1>

        <p className="mt-5 leading-7 text-slate-400">
          Please try again. Your portfolio data has not been deleted.
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-slate-600">
            Error reference, {error.digest}.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="premium-button rounded-full px-7 py-4 font-semibold text-white"
          >
            Try Again.
          </button>

          <a
            href="/"
            className="secondary-button rounded-full px-7 py-4 font-semibold text-white"
          >
            Return Home.
          </a>
        </div>
      </div>
    </main>
  );
}