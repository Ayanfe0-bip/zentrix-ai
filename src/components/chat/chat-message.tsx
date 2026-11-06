"use client";

import { useState } from "react";
import ZentrixLogo from "@/components/zentrix-logo";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function renderContent(content: string) {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.split("\n");
        const language = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");

        return (
          <div
            key={index}
            className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#080b18]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-xs text-slate-400">
                {language || "Code"}
              </span>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs text-slate-400 transition hover:text-white"
              >
                Copy code
              </button>
            </div>

            <pre className="overflow-x-auto p-4 text-xs leading-6 text-cyan-100 sm:text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }

  return (
    <article
      className={`group flex w-full gap-3 py-5 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/10">
          <ZentrixLogo />
        </div>
      )}

      <div
        className={`flex min-w-0 flex-col ${
          isUser
            ? "max-w-[88%] items-end sm:max-w-[80%]"
            : "max-w-[95%] flex-1 items-start"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? "You" : "ZENTRIX"}
          </span>

          {message.timestamp && (
            <span className="text-[10px] text-slate-500">
              {message.timestamp}
            </span>
          )}
        </div>

        <div
          className={`text-sm leading-7 sm:text-[15px] sm:leading-8 ${
            isUser
              ? "rounded-2xl rounded-tr-sm border border-violet-400/20 bg-violet-500/15 px-4 py-3 text-white"
              : "w-full text-slate-200"
          }`}
        >
          {renderContent(message.content)}
        </div>

        {!isUser && (
          <div className="mt-3 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={copyMessage}
              className="rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white">
          U
        </div>
      )}
    </article>
  );
}
