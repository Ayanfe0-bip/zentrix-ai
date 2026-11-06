export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070817] text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[110px]" />

      <div className="pointer-events-none absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-cyan-500/10 blur-[90px]" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 shadow-2xl shadow-violet-950/40">
          <div className="absolute inset-0 animate-pulse rounded-[28px] bg-violet-500/10 blur-xl" />

          <span className="relative bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-5xl font-bold text-transparent">
            Z
          </span>
        </div>

        <h1 className="mt-7 text-2xl font-bold tracking-[0.18em]">
          ZENTRIX
          <span className="text-violet-400"> AI</span>
        </h1>

        <p className="mt-2 text-xs font-medium tracking-[0.25em] text-slate-500">
          THINK BEYOND. BUILD WITHOUT LIMITS.
        </p>

        <div className="mt-10 flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Preparing your intelligent workspace...
        </p>
      </div>
    </main>
  );
        }
