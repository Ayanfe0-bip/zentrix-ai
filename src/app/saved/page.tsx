"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import {
  getSavedConversations,
  toggleConversationSaved,
  deleteConversation,
  type StoredConversation,
} from "@/lib/chat-storage";

export default function SavedPage() {
  const [conversations, setConversations] = useState<
    StoredConversation[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConversations(getSavedConversations());
    setReady(true);
  }, []);

  function handleUnsave(id: string) {
    const updated = toggleConversationSaved(id);
    setConversations(updated.filter((item) => item.saved));
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Permanently delete this conversation?"
    );

    if (!confirmed) return;

    deleteConversation(id);
    setConversations((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#070817]">
      <AppSidebar
        activeItem="Saved Conversations"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Saved Conversations"
          subtitle="Your bookmarked AI conversations"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl">
                🔖
              </div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Your Saved Library
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Keep important conversations close. Your saved
                chats are stored on this device.
              </p>
            </div>

            {!ready ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
                Loading your saved conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
                  ✨
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Nothing saved yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Your bookmarked conversations will appear
                  here when you start saving chats.
                </p>

                <Link
                  href="/chat"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Start a Conversation
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    {conversations.length} saved conversation
                    {conversations.length === 1 ? "" : "s"}
                  </p>
                </div>

                {conversations.map((conversation) => (
                  <article
                    key={conversation.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-violet-500/30 hover:bg-white/[0.05]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-white">
                          {conversation.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                          {conversation.messages[
                            conversation.messages.length - 1
                          ]?.content || "No messages available."}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          {conversation.messages.length} messages
                          {" · "}
                          {new Date(
                            conversation.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link
                          href={`/chat?conversation=${encodeURIComponent(
                            conversation.id
                          )}`}
                          className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                        >
                          Open Chat
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleUnsave(conversation.id)
                          }
                          className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                        >
                          Unsave
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(conversation.id)
                          }
                          aria-label="Delete conversation"
                          className="rounded-xl border border-red-400/20 px-3 py-2.5 text-xs text-red-300 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
                }
