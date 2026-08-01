export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#03050d] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          Loading portfolio.
        </p>
      </div>
    </main>
  );
}