"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("ZENTRIX application error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070817] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-red-500/10 text-4xl">
          !
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
          ZENTRIX AI
        </p>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Something went wrong
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-400">
          We encountered an unexpected problem while loading
          this experience. You can try again or return to the
          ZENTRIX homepage.
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-slate-600">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 active:scale-95"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-600">
          Think Beyond. Build Without Limits.
        </p>
      </div>
    </main>
  );
}
