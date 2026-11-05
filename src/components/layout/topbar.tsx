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
    <header className="relative z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#090c1d]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-white sm:text-lg">
            {title}
          </h1>

          <p className="hidden truncate text-xs text-slate-500 sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ModelSelector
          selectedModel={modelName}
          onModelChange={(model) => onModelChange?.(model)}
        />

        <button
          type="button"
          onClick={onNewChat}
          aria-label="Start new conversation"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 sm:hidden"
        >
          <span className="text-xl">+</span>
        </button>

        <button
          type="button"
          onClick={onNewChat}
          className="hidden items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20 sm:flex"
        >
          <span className="text-base">+</span>
          New Chat
        </button>
      </div>
    </header>
  );
}
