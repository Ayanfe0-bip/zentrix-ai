"use client";

import { useState } from "react";

interface GeneratedImageProps {
  image: string;
  prompt: string;
  mediaType?: string;
  onEdit?: (prompt: string) => void;
  onRegenerate?: () => void;
}

function Icon({
  name,
}: {
  name: "expand" | "close" | "download" | "edit" | "refresh";
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths = {
    expand: (
      <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5M12 15V3" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
        <path d="m15 5 4 4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      {...common}
    >
      {paths[name]}
    </svg>
  );
}

export default function GeneratedImage({
  image,
  prompt,
  mediaType = "image/png",
  onEdit,
  onRegenerate,
}: GeneratedImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const imageUrl =
    image.startsWith("data:") ||
    image.startsWith("blob:") ||
    image.startsWith("https://") ||
    image.startsWith("http://")
      ? image
      : `data:${mediaType};base64,${image}`;

  function downloadImage() {
    const link = document.createElement("a");

    link.href = imageUrl;
    link.download = `zentrix-image-${Date.now()}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);

    window.setTimeout(() => {
      setDownloaded(false);
    }, 2000);
  }

  return (
    <>
      <div className="my-5 w-full max-w-xl overflow-hidden rounded-2xl border border-violet-400/20 bg-[#111426] shadow-xl shadow-black/20">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="group relative block w-full overflow-hidden bg-black/20"
          aria-label="View generated image in full screen"
        >
          <img
            src={imageUrl}
            alt={prompt || "AI generated image"}
            className="block h-auto max-h-[520px] w-full object-contain transition duration-500 group-hover:scale-[1.02]"
          />

          <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/65 px-3 py-2 text-xs font-medium text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
            <Icon name="expand" />
            Enlarge image
          </span>
        </button>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-3 py-3">
          <span className="text-xs font-medium text-slate-400">
            Created with ZENTRIX
          </span>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(prompt)}
                title="Retouch image"
                aria-label="Retouch image"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/20"
              >
                <Icon name="edit" />
              </button>
            )}

            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Generate another version"
                aria-label="Regenerate image"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="refresh" />
              </button>
            )}

            <button
              type="button"
              onClick={downloadImage}
              title="Download image"
              aria-label="Download image"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
            >
              <Icon name="download" />
            </button>
          </div>
        </div>

        {downloaded && (
          <div className="border-t border-cyan-400/10 px-3 py-2 text-center text-xs text-cyan-300">
            Your image download has started.
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#03040b]/95 p-3 backdrop-blur-xl sm:p-8"
          onClick={() => setIsExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Generated image preview"
        >
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Close image preview"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <Icon name="close" />
          </button>

          <img
            src={imageUrl}
            alt={prompt || "Full-size generated image"}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-xl object-contain shadow-2xl"
          />

          <div
            className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-[#17192a]/95 p-2 shadow-2xl backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onEdit(prompt);
                }}
                className="flex items-center gap-2 rounded-xl bg-violet-500/15 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/25"
              >
                <Icon name="edit" />
                Retouch
              </button>
            )}

            <button
              type="button"
              onClick={downloadImage}
              className="flex items-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/25"
            >
              <Icon name="download" />
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
                }
