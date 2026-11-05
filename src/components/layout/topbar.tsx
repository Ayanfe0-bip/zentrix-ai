"use client";

import { useState } from "react";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onNewChat?: () => void;
  modelName?: string;
  onModelChange?: (model: string) => void;
}

const models = [
  "Auto Select",
  "Fast Model",
  "Advanced Model",
];

export default function Topbar({
  title = "AI Chat",
  subtitle = "Your intelligent workspace",
  onMenuClick,
  onNewChat,
  modelName = "Auto Select",
  onModelChange,
}: TopbarProps) {
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

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
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={modelMenuOpen}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:border-violet-500/40 hover:bg-white/[0.06]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

            <span className="hidden sm:inline">{modelName}</span>
            <span className="sm:hidden">Model</span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path
                d="m7 10 5 5 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {modelMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close model menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setModelMenuOpen(false)}
              />

              <div
                role="listbox"
                aria-label="Choose AI model"
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#11162c] p-1.5 shadow-2xl shadow-black/40"
              >
                {models.map((model) => (
                  <button
                    key={model}
                    type="button"
                    role="option"
                    aria-selected={modelName === model}
                    onClick={() => {
                      onModelChange?.(model);
                      setModelMenuOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-xs transition ${
                      modelName === model
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onNewChat}
          aria-label="Start new conversation"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 sm:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              d="M12 5v14m-7-7h14"
              strokeLinecap="round"
            />
          </svg>
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
