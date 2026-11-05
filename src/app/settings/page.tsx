"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import {
  getConversations,
  clearConversationHistory,
} from "@/lib/chat-storage";

interface Preferences {
  theme: "dark" | "light";
  responseStyle: "balanced" | "concise" | "detailed" | "creative";
  enterToSend: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  responseStyle: "balanced",
  enterToSend: true,
};

const STORAGE_KEY = "zentrix-ai-preferences";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.style.colorScheme = preferences.theme;
  }, [preferences.theme, ready]);

  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) {
    const updated = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      window.dispatchEvent(
        new Event("zentrix-theme-updated")
      );

      setNotice("Your preferences have been saved.");
    } catch {
      setNotice("Unable to save preferences on this device.");
    }
  }

  function exportConversations() {
    const conversations = getConversations();

    const file = new Blob(
      [JSON.stringify(conversations, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "zentrix-conversations.json";
    link.click();

    URL.revokeObjectURL(url);
    setNotice("Conversation export started.");
  }

  function handleClearHistory() {
    const confirmed = window.confirm(
      "This will permanently delete all conversations stored on this device. Continue?"
    );

    if (!confirmed) return;

    const success = clearConversationHistory();

    setNotice(
      success
        ? "Your conversation history has been cleared."
        : "Unable to clear conversation history."
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#070817]">
      <AppSidebar
        activeItem="Settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Settings"
          subtitle="Personalize your ZENTRIX experience"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                Your Workspace
              </p>

              <h2 className="text-3xl font-bold text-white">
                Preferences & Settings
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Customize how ZENTRIX looks and responds to you.
              </p>
            </div>

            {notice && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300"
              >
                {notice}
              </div>
            )}

            {!ready ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
                Loading preferences...
              </div>
            ) : (
              <div className="space-y-6">
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Appearance
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose your preferred workspace appearance.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(["dark", "light"] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        aria-pressed={preferences.theme === theme}
                        onClick={() => updatePreference("theme", theme)}
                        className={`rounded-xl border p-4 text-left transition ${
                          preferences.theme === theme
                            ? "border-violet-400/50 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="mb-3 text-2xl">
                          {theme === "dark" ? "🌙" : "☀️"}
                        </div>

                        <p className="text-sm font-semibold capitalize text-white">
                          {theme} mode
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {theme === "dark"
                            ? "Midnight workspace"
                            : "Bright workspace"}
                        </p>

                        {preferences.theme === theme && (
                          <span className="mt-3 inline-block text-xs font-semibold text-violet-400">
                            Currently active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Your selected theme is applied to the global workspace
                    and saved on this device.
                  </p>
                </section>

                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-white">
                    AI Response Style
                  </h3>

                  <p className="mb-5 mt-1 text-sm text-slate-500">
                    Choose how you prefer AI responses to be written.
                  </p>

                  <div className="space-y-2">
                    {[
                      {
                        value: "balanced",
                        label: "Balanced",
                        description: "A helpful mix of detail and clarity.",
                      },
                      {
                        value: "concise",
                        label: "Concise",
                        description: "Short, direct answers.",
                      },
                      {
                        value: "detailed",
                        label: "Detailed",
                        description: "Thorough explanations and examples.",
                      },
                      {
                        value: "creative",
                        label: "Creative",
                        description: "More imaginative and expressive responses.",
                      },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() =>
                          updatePreference(
                            "responseStyle",
                            style.value as Preferences["responseStyle"]
                          )
                        }
                        className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                          preferences.responseStyle === style.value
                            ? "border-violet-400/40 bg-violet-500/10"
                            : "border-white/[0.08] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {style.label}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {style.description}
                          </p>
                        </div>

                        <span className="text-violet-400">
                          {preferences.responseStyle === style.value
                            ? "●"
                            : "○"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Your selected response style is saved locally and
                    applied to new AI responses.
                  </p>
                </section>

                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Chat Preferences
                  </h3>

                  <p className="mb-5 mt-1 text-sm text-slate-500">
                    Control your conversation experience.
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Enter to send
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Use Enter as your message send shortcut.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label="Enter to send"
                      aria-checked={preferences.enterToSend}
                      onClick={() =>
                        updatePreference(
                          "enterToSend",
                          !preferences.enterToSend
                        )
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        preferences.enterToSend
                          ? "bg-violet-600"
                          : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          preferences.enterToSend
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Data Management
                  </h3>

                  <p className="mb-5 mt-1 text-sm text-slate-500">
                    Manage conversations stored in this browser.
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={exportConversations}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 p-4 text-left transition hover:bg-white/[0.05]"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          Export conversations
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Download your conversation history as JSON.
                        </p>
                      </div>

                      <span className="text-lg text-cyan-300">↓</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="flex w-full items-center justify-between rounded-xl border border-red-400/20 p-4 text-left transition hover:bg-red-500/[0.06]"
                    >
                      <div>
                        <p className="text-sm font-medium text-red-300">
                          Clear conversation history
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Permanently delete chats stored on this device.
                        </p>
                      </div>

                      <span className="text-lg text-red-300">⌫</span>
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] to-cyan-500/[0.04] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl font-bold text-violet-300">
                      Z
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        ZENTRIX AI
                      </h3>

                      <p className="text-xs text-slate-400">
                        Think Beyond. Build Without Limits.
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    An AI workspace by Ayanfe Innovation Labs Limited.
                    Designed to help people think, create, learn, and build.
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    Version 1.0.0 · Preferences stored on this device
                  </p>
                </section>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
                      }
