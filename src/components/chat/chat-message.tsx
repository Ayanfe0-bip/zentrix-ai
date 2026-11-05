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
            className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#080b18]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="text-xs text-slate-400">
                {language || "Code"}
              </span>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(code)
                }
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/10">
          <ZentrixLogo />
        </div>
      )}

      <div
        className={`min-w-0 max-w-[90%] sm:max-w-[82%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
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
          className={`rounded-2xl px-4 py-3 text-sm leading-7 sm:px-5 ${
            isUser
              ? "rounded-tr-sm border border-violet-400/20 bg-gradient-to-br from-violet-600/25 to-purple-600/15 text-white"
              : "rounded-tl-sm border border-white/[0.07] bg-white/[0.025] text-slate-200"
          }`}
        >
          {renderContent(message.content)}
        </div>

        {!isUser && (
          <div className="mt-2 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white">
          U
        </div>
      )}
    </article>
  );
                }
