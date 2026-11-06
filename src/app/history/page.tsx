"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import {
  getChatHistory,
  searchConversations,
  renameConversation,
  deleteConversation,
  deleteAllConversations,
  type StoredConversation,
} from "@/lib/chat-storage";

const GROUP_ORDER = [
  "Today",
  "Yesterday",
  "Previous 7 Days",
  "Older",
];

function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (date >= today) return "Today";
  if (date >= yesterday && date < today) return "Yesterday";
  if (date >= sevenDaysAgo) return "Previous 7 Days";

  return "Older";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<
    StoredConversation[]
  >([]);

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConversations(getChatHistory());
    setReady(true);
  }, []);

  const filteredConversations = useMemo(() => {
    return search.trim()
      ? searchConversations(search)
      : conversations;
  }, [search, conversations]);

  const groupedConversations = useMemo(() => {
    const groups: Record<string, StoredConversation[]> = {};

    GROUP_ORDER.forEach((group) => {
      groups[group] = [];
    });

    filteredConversations.forEach((conversation) => {
      const group = getDateGroup(conversation.updatedAt);
      groups[group].push(conversation);
    });

    return groups;
  }, [filteredConversations]);

  function refreshHistory() {
    setConversations(getChatHistory());
  }

  function handleRename(conversation: StoredConversation) {
    const newTitle = window.prompt(
      "Enter a new conversation name:",
      conversation.title
    );

    if (newTitle === null) return;

    if (!newTitle.trim()) {
      window.alert("Conversation name cannot be empty.");
      return;
    }

    const success = renameConversation(
      conversation.id,
      newTitle
    );

    if (success) {
      refreshHistory();
    } else {
      window.alert("Unable to rename this conversation.");
    }
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this conversation?"
    );

    if (!confirmed) return;

    deleteConversation(id);
    refreshHistory();
  }

  function handleClearHistory() {
    if (conversations.length === 0) return;

    const confirmed = window.confirm(
      "This will permanently delete ALL your conversations, including saved chats. This action cannot be undone. Continue?"
    );

    if (!confirmed) return;

    const success = deleteAllConversations();

    if (success) {
      setConversations([]);
      setSearch("");
    } else {
      window.alert("Unable to clear chat history.");
    }
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#070817]">
      <AppSidebar
        activeItem="Chat History"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Chat History"
          subtitle="Find and manage your conversations"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto px-4 py-7 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">

            {/* Page heading */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl">
                  🕘
                </div>

                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Your Conversation History
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Every conversation in one place. Search,
                  revisit and continue where you left off.
                </p>
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110"
              >
                <span>+</span>
                New Conversation
              </Link>
            </div>

            {/* Search and controls */}
            <div className="mb-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search your conversations..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b0d20] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  {filteredConversations.length} conversation
                  {filteredConversations.length === 1 ? "" : "s"} found
                </p>

                {conversations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Clear All History
                  </button>
                )}
              </div>
            </div>

            {/* Conversation list */}
            {!ready ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-slate-400">
                Loading your conversation history...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
                  {search ? "🔎" : "💬"}
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {search
                    ? "No matching conversations"
                    : "Your history is empty"}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  {search
                    ? "Try another search term to find your conversation."
                    : "Start chatting with ZENTRIX AI. Your conversations will appear here."}
                </p>

                {!search && (
                  <Link
                    href="/chat"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    Start Chatting
                    <span>→</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-9">
                {GROUP_ORDER.map((group) => {
                  const items = groupedConversations[group];

                  if (!items || items.length === 0) {
                    return null;
                  }

                  return (
                    <section key={group}>
                      <div className="mb-4 flex items-center gap-3">
                        <h3 className="text-sm font-bold text-white">
                          {group}
                        </h3>

                        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">
                          {items.length}
                        </span>

                        <div className="h-px flex-1 bg-white/[0.07]" />
                      </div>

                      <div className="space-y-3">
                        {items.map((conversation) => {
                          const lastMessage =
                            conversation.messages[
                              conversation.messages.length - 1
                            ];

                          return (
                            <article
                              key={conversation.id}
                              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-violet-500/30 hover:bg-white/[0.05] sm:p-5"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/10 text-lg">
                                  💬
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="truncate text-sm font-semibold text-white sm:text-base">
                                      {conversation.title}
                                    </h4>

                                    {conversation.saved && (
                                      <span className="text-xs text-amber-300">
                                        ★ Saved
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400 sm:text-sm">
                                    {lastMessage?.content ||
                                      "No messages available."}
                                  </p>

                                  <p className="mt-2 text-[11px] text-slate-500">
                                    {conversation.messages.length} messages
                                    {" · "}
                                    {formatDate(conversation.updatedAt)}
                                  </p>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                  <Link
                                    href={`/chat?conversation=${encodeURIComponent(
                                      conversation.id
                                    )}`}
                                    className="rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                                  >
                                    Continue
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRename(conversation)
                                    }
                                    aria-label="Rename conversation"
                                    className="rounded-lg border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-white/10"
                                  >
                                    Rename
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(conversation.id)
                                    }
                                    aria-label="Delete conversation"
                                    className="rounded-lg border border-red-400/20 px-3 py-2.5 text-xs text-red-300 transition hover:bg-red-500/10"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {/* Storage information */}
            <div className="mt-10 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔒</span>

                <div>
                  <h4 className="text-xs font-semibold text-cyan-300">
                    Your conversation privacy
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your chat history is currently stored locally
                    in this browser on this device. Cloud
                    synchronization will be a separate upgrade.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
    }
