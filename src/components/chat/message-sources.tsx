"use client";

export interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

interface MessageSourcesProps {
  sources: WebSource[];
}

export default function MessageSources({
  sources,
}: MessageSourcesProps) {
  if (!sources || sources.length === 0) return null;

  const validSources = sources.filter((source) => {
    try {
      const url = new URL(source.url);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  });

  if (validSources.length === 0) return null;

  return (
    <section className="mt-5 w-full max-w-2xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white">
            Research Sources
          </h3>
          <p className="text-[10px] text-slate-500">
            {validSources.length} sources referenced
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {validSources.map((source, index) => {
          let hostname = "";

          try {
            hostname = new URL(source.url).hostname.replace(
              /^www\./,
              ""
            );
          } catch {
            hostname = "External website";
          }

          return (
            <a
              key={`${source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-cyan-400">
                  {hostname}
                </span>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5 shrink-0 text-slate-500 transition group-hover:text-cyan-300"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M14 4h6v6" />
                  <path d="M20 4 10 14" />
                  <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
                </svg>
              </div>

              <h4 className="line-clamp-2 text-xs font-medium leading-5 text-slate-200 group-hover:text-white">
                {source.title || hostname}
              </h4>

              {source.snippet && (
                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                  {source.snippet}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
                  }
