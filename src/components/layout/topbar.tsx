"use client";

import ModelSelector from "@/components/chat/model-selector";
import { DEFAULT_MODEL } from "@/lib/ai/models";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onNewChat?: () => void;
  modelName?: string;
  onModelChange?: (model: string) => void;
}

export default function Topbar({
  title = "AI Chat",
  subtitle = "Your intelligent workspace",
  onMenuClick,
  onNewChat,
  modelName = DEFAULT_MODEL,
  onModelChange,
}: TopbarProps) {
  return (
    <header className="relative z-30 flex min-h-[76px] shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-500 focus-visible:outline-2 focus-visible:outline-violet-500 lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[var(--foreground)] sm:text-lg">
            {title}
          </h1>

          <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {onModelChange && (
          <div className="max-w-[150px] sm:max-w-none">
            <ModelSelector
              selectedModel={modelName}
              onModelChange={onModelChange}
            />
          </div>
        )}

        {onNewChat && (
          <>
            {/* Mobile new chat */}
            <button
              type="button"
              onClick={onNewChat}
              aria-label="Start new conversation"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 active:scale-95 sm:hidden"
            >
              <span className="text-xl" aria-hidden="true">
                +
              </span>
            </button>

            {/* Desktop new chat */}
            <button
              type="button"
              onClick={onNewChat}
              className="hidden items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-400 transition hover:border-violet-500/50 hover:bg-violet-500/15 sm:flex"
            >
              <span className="text-base" aria-hidden="true">
                +
              </span>
              New Chat
            </button>
          </>
        )}
      </div>
    </header>
  );
}
