"use client";

import { useEffect, useRef, useState } from "react";

type VideoResult = {
  success: boolean;
  videoId?: string;
  status?: string;
  error?: string;
};

type VideoStatus = {
  success: boolean;
  status?: string;
  progress?: number;
  videoUrl?: string | null;
  error?: string | null;
};

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [seconds, setSeconds] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const stopped = useRef(false);

  useEffect(() => {
    return () => {
      stopped.current = true;
    };
  }, []);

  async function generateVideo() {
    if (!prompt.trim() || loading) return;

    stopped.current = false;
    setLoading(true);
    setError("");
    setVideoUrl("");
    setProgress(0);
    setStatus("Starting video generation...");

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          seconds: Number(seconds),
          aspectRatio,
        }),
      });

      const result: VideoResult = await response.json();

      if (!response.ok || !result.success || !result.videoId) {
        throw new Error(
          result.error || "Unable to start video generation."
        );
      }

      setStatus("Your video is being created...");

      for (let attempt = 0; attempt < 120; attempt++) {
        if (stopped.current) return;

        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (stopped.current) return;

        const check = await fetch(
          `/api/video?video_id=${encodeURIComponent(result.videoId)}`,
          { cache: "no-store" }
        );

        const data: VideoStatus = await check.json();

        if (!check.ok || !data.success) {
          throw new Error(
            data.error || "Unable to check video progress."
          );
        }

        const currentProgress = Number(data.progress) || 0;

        setProgress(
          Math.min(100, Math.max(0, currentProgress))
        );

        const currentStatus = (data.status || "processing").toLowerCase();

        if (
          ["completed", "complete", "success", "succeeded", "finished"].includes(
            currentStatus
          )
        ) {
          if (!data.videoUrl) {
            throw new Error("Video finished, but no video link was returned.");
          }

          setVideoUrl(data.videoUrl);
          setProgress(100);
          setStatus("Your video is ready!");
          return;
        }

        if (
          ["failed", "error", "cancelled", "canceled"].includes(
            currentStatus
          )
        ) {
          throw new Error(data.error || "Video generation failed.");
        }

        setStatus("Generating your video...");
      }

      throw new Error(
        "Video generation is taking longer than expected. Please try checking again later."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            ZENTRIX AI CREATIVE TOOLS
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Video Generator
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Turn your imagination into videos. Describe the scene
            you want and let ZENTRIX bring it to life.
          </p>
        </div>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:p-7">
          <label
            htmlFor="video-prompt"
            className="mb-3 block text-sm font-semibold"
          >
            Describe your video
          </label>

          <textarea
            id="video-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: A cinematic drone shot flying over a beautiful tropical beach at sunset, realistic lighting, gentle ocean waves..."
            maxLength={3000}
            rows={6}
            disabled={loading}
            className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none transition placeholder:text-slate-500 focus:border-violet-500 disabled:opacity-60"
          />

          <div className="mt-2 text-right text-xs text-slate-500">
            {prompt.length}/3000
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="video-duration"
                className="mb-2 block text-sm font-semibold"
              >
                Video duration
              </label>

              <select
                id="video-duration"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm outline-none focus:border-violet-500"
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                  <option key={value} value={value}>
                    {value} seconds
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="video-ratio"
                className="mb-2 block text-sm font-semibold"
              >
                Video format
              </label>

              <select
                id="video-ratio"
                value={aspectRatio}
                onChange={(event) => setAspectRatio(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm outline-none focus:border-violet-500"
              >
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Classic (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="21:9">Cinematic (21:9)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={generateVideo}
            disabled={!prompt.trim() || loading}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-900/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating your video...
              </>
            ) : (
              "Generate Video"
            )}
          </button>

          {loading && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-700/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {videoUrl && (
            <div className="mt-7">
              <h2 className="mb-4 text-lg font-bold text-emerald-400">
                Your video is ready!
              </h2>

              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full rounded-2xl border border-[var(--border)] bg-black"
              />

              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-violet-500/40 px-5 py-3 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/10"
              >
                Preview / Download Video
              </a>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs leading-6 text-slate-500">
          Powered by Agnes AI · Video generation may take several minutes.
        </p>
      </div>
    </main>
  );
}
