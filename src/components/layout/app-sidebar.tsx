"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ZentrixLogo from "@/components/zentrix-logo";
import ModelSelector from "@/components/chat/model-selector";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import SidebarAuthAction from "@/components/layout/sidebar-auth-action";
export interface ChatHistoryItem {
  id: string;
  title: string;
}

interface AppSidebarProps {
  activeItem?: string;
  chats?: ChatHistoryItem[];
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const navigationItems = [
  { label: "AI Chat", href: "/chat", icon: "chat" },
  { label: "Chat History", href: "/history", icon: "history" },
  { label: "Code Assistant", href: "/code", icon: "code" },
  { label: "Code Generation Studio", href: "/studio", icon: "code" },
    { label: "AI App Builder", href: "/app-builder", icon: "cpu" },
  { label: "Plugin Marketplace", href: "/plugins", icon: "plugin" },
  { label: "Saved Conversations", href: "/saved", icon: "bookmark" },
];

function SidebarIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    chat: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    ),
    code: (
      <>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
        <path d="m14 4-4 16" />
      </>
    ),
    plugin: (
      <path d="M9 3v3H6a2 2 0 0 0-2 2v3h3a2 2 0 1 1 0 4H4v3a2 2 0 0 0 2 2h3v-3a2 2 0 1 1 4 0v3h3a2 2 0 0 0 2-2v-3h-3a2 2 0 1 1 0-4h3V8a2 2 0 0 0-2-2h-3V3a2 2 0 1 0-4 0z" />
    ),
    bookmark: (
      <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V22l-6-4-6 4z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 1.8z" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    plus: <path d="M12 5v14m-7-7h14" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    cpu: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function AppSidebar({
  activeItem = "AI Chat",
  chats = [],
  onNewChat,
  onSelectChat,
  onClose,
  isOpen = true,
  selectedModel = DEFAULT_MODEL,
  onModelChange,
}: AppSidebarProps) {
  const [profileName, setProfileName] = useState("ZENTRIX User");
  const [profileInitials, setProfileInitials] = useState("Z");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

useEffect(() => {
  const saved = localStorage.getItem("zentrix-ai-preferences");

  if (saved) {
    try {
      const preferences = JSON.parse(saved);
      setTheme(preferences.theme === "light" ? "light" : "dark");
    } catch {
      setTheme("dark");
    }
  }
}, []);

function toggleTheme() {
  const nextTheme = theme === "dark" ? "light" : "dark";

  setTheme(nextTheme);

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  try {
    const saved = localStorage.getItem("zentrix-ai-preferences");
    const preferences = saved ? JSON.parse(saved) : {};

    preferences.theme = nextTheme;

    localStorage.setItem(
      "zentrix-ai-preferences",
      JSON.stringify(preferences)
    );
  } catch {
    console.error("Unable to save theme preference.");
  }

  window.dispatchEvent(new Event("zentrix-theme-updated"));
}
  useEffect(() => {
    function loadProfile(event?: Event) {
      try {
        let profile: { displayName?: string } | null = null;

        if (event instanceof CustomEvent && event.detail) {
          profile = event.detail;
        } else {
          const stored = localStorage.getItem("zentrix-ai-profile");
          if (stored) profile = JSON.parse(stored);
        }

        if (
          profile &&
          typeof profile.displayName === "string" &&
          profile.displayName.trim()
        ) {
          const name = profile.displayName.trim();
          setProfileName(name);

          const initials = name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("");

          setProfileInitials(initials || "Z");
        } else {
          setProfileName("ZENTRIX User");
          setProfileInitials("Z");
        }
      } catch {
        setProfileName("ZENTRIX User");
        setProfileInitials("Z");
      }
    }

    loadProfile();
    window.addEventListener("storage", loadProfile);
    window.addEventListener("zentrix-profile-updated", loadProfile);

    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("zentrix-profile-updated", loadProfile);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto overscroll-contain border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/" onClick={onClose} aria-label="ZENTRIX AI home">
            <ZentrixLogo />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-black/5 hover:text-violet-500 lg:hidden"
          >
            <SidebarIcon name="close" />
          </button>
        </div>

        <div className="px-4 pt-6">
          <button
            type="button"
            onClick={() => {
              onNewChat?.();
              onClose?.();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <SidebarIcon name="plus" className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        <nav className="space-y-1 px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          {navigationItems.map((item) => {
            const active = activeItem === item.label;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                  active
                    ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                    : "border-transparent text-slate-500 hover:bg-black/[0.04] hover:text-violet-500"
                }`}
              >
                <SidebarIcon name={item.icon} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mt-6 border-t border-[var(--border)]" />

        <section className="shrink-0 px-4 pt-5">
          <div className="mb-3 flex items-center gap-2 px-3">
            <SidebarIcon name="cpu" className="h-4 w-4 text-violet-400" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              AI Models
            </p>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3">
            <p className="mb-2 text-xs font-medium text-slate-400">
              Choose your model
            </p>

            {onModelChange ? (
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
              />
            ) : (
              <p className="text-xs text-slate-400">
                {selectedModel}
              </p>
            )}
          </div>
        </section>

        <div className="mx-4 mt-5 border-t border-[var(--border)]" />

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-5">
          <div className="mb-4 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recent Conversations
            </p>
            <SidebarIcon name="history" className="h-4 w-4 text-slate-500" />
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => {
                    onSelectChat?.(chat.id);
                    onClose?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-black/[0.04] hover:text-violet-500"
                >
                  <SidebarIcon name="chat" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-xs leading-6 text-slate-500">
                Your recent conversations will appear here.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <Link
            href="/profile"
            onClick={onClose}
            aria-current={activeItem === "Profile" ? "page" : undefined}
            className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              activeItem === "Profile"
                ? "bg-violet-500/10 text-violet-400"
                : "text-slate-500 hover:bg-black/[0.04] hover:text-violet-500"
            }`}
          >
            <SidebarIcon name="profile" />
            My Profile
          </Link>

          <Link
            href="/settings"
            onClick={onClose}
            aria-current={activeItem === "Settings" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              activeItem === "Settings"
                ? "bg-violet-500/10 text-violet-400"
                : "text-slate-500 hover:bg-black/[0.04] hover:text-violet-500"
            }`}
          >
            <SidebarIcon name="settings" />
            Settings
          </Link>

          <Link
            href="/profile"
            onClick={onClose}
            className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-light)] p-3 transition hover:border-violet-500/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white">
              {profileInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {profileName}
              </p>
              <p className="text-xs text-slate-500">Free Workspace</p>
            </div>
          </Link>
          <SidebarAuthAction />
        </div>
      </aside>
    </>
  );
}
