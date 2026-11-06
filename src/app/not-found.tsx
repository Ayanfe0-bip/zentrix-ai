import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b18] px-6 py-16 text-white">
      <div className="ambient-glow violet" />
      <div className="ambient-glow cyan" />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/30 bg-violet-500/10 shadow-2xl shadow-violet-500/10">
          <span className="text-4xl font-bold text-violet-300">
            Z
          </span>
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">
          ZENTRIX AI
        </p>

        <h1 className="text-8xl font-extrabold tracking-tighter sm:text-9xl">
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
          Lost in the digital universe?
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have
          been moved. Don&apos;t worry. Your next great idea is still
          waiting for you.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-1 hover:shadow-violet-500/40"
          >
            Return Home
          </Link>

          <Link
            href="/chat"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/[0.08]"
          >
            Open AI Workspace
          </Link>
        </div>

        <p className="mt-14 text-xs text-slate-600">
          Think Beyond. Build Without Limits.
        </p>

        <p className="mt-2 text-[10px] text-slate-700">
          © {new Date().getFullYear()} Ayanfe Innovation Labs Limited
        </p>
      </div>
    </main>
  );
      }
