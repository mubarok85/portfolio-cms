export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#03050d] px-6 text-white">
      <div className="premium-card w-full max-w-xl rounded-[32px] p-8 text-center md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
          Error 404.
        </p>

        <h1 className="mt-5 text-4xl font-bold md:text-5xl">
          Page not found.
        </h1>

        <p className="mt-5 leading-7 text-slate-400">
          The page you requested does not exist or may have been moved.
        </p>

        <a
          href="/"
          className="premium-button mt-8 inline-flex rounded-full px-8 py-4 font-semibold text-white"
        >
          Return Home.
        </a>
      </div>
    </main>
  );
}