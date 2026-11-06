"use client";

import { useState } from "react";
import { FileDown, LoaderCircle, Check } from "lucide-react";
import { downloadMessageAsPdf } from "@/lib/pdf/generate-pdf";

interface MessagePdfButtonProps {
  content: string;
}

function getDocumentTitle(content: string): string {
  const heading = content.match(/^#{1,2}\s+(.+)$/m);

  if (heading?.[1]) {
    return heading[1].replace(/[*_`]/g, "").trim().slice(0, 70);
  }

  const firstLine = content
    .split("\n")
    .find((line) => line.trim().length > 0);

  return (firstLine || "ZENTRIX Document")
    .replace(/[*_`#]/g, "")
    .trim()
    .slice(0, 70);
}

export default function MessagePdfButton({
  content,
}: MessagePdfButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  function handleDownload() {
    try {
      setStatus("loading");

      const title = getDocumentTitle(content);

      downloadMessageAsPdf(title, content);

      setStatus("success");

      window.setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setStatus("error");

      window.setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === "loading"}
      title="Download this response as PDF"
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-50"
    >
      {status === "loading" ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : status === "success" ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}

      {status === "success"
        ? "PDF Ready!"
        : status === "error"
          ? "Try Again"
          : "Download PDF"}
    </button>
  );
}
