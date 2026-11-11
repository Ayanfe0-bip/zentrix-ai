"use client";

import { useEffect, useRef, useState } from "react";

import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import ChatMessage from "@/components/chat/chat-message";
import ChatInput from "@/components/chat/chat-input";
import ZentrixLogo from "@/components/zentrix-logo";

import type { ChatMessageData } from "@/components/chat/chat-message";
import type { ChatHistoryItem } from "@/components/layout/app-sidebar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

interface ChatInterfaceProps {
  messages: ChatMessageData[];
  onSend: (message: string, images?: string[]) => void;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  chats?: ChatHistoryItem[];
  isGenerating?: boolean;
  onStop?: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export default function ChatInterface({
  messages,
  onSend,
  onNewChat,
  onSelectChat,
  chats = [],
  isGenerating = false,
  onStop,
  selectedModel = DEFAULT_MODEL,
  onModelChange,
  isSaved = false,
  onToggleSave,
}: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isGenerating]);

  function handleNewChat() {
    onNewChat?.();
    setSidebarOpen(false);
  }

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[#080817] text-white">
      <AppSidebar
        activeItem="AI Chat"
        chats={chats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={onSelectChat}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />

      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          title="ZENTRIX"
          subtitle="Your intelligent workspace"
          onMenuClick={() => setSidebarOpen(true)}
          onNewChat={handleNewChat}
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[120px]" />

          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-500/[0.05] blur-[130px]" />

          <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {!hasMessages ? (
              <div className="flex min-h-full flex-col items-center justify-center px-5 py-12">
                <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-cyan-400/10 shadow-[0_0_45px_rgba(139,92,246,0.12)]">
                  <ZentrixLogo
                    size="large"
                    showName={false}
                  />
                </div>

                <div className="max-w-2xl text-center">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                    Welcome to ZENTRIX
                  </p>

                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Welcome!
                    <span className="mt-2 block bg-gradient-to-r from-violet-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                      How can I help you today?
                    </span>
                  </h1>

                  <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                    Ask anything, explore ideas, solve problems,
                    or bring your next big project to life.
                  </p>

                  <p className="mt-7 text-xs leading-6 text-slate-500">
                    Try asking a question, writing something,
                    learning a skill, or sharing an idea.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Conversation
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleSave}
                    disabled={!onToggleSave || isGenerating}
                    className={`rounded-xl border px-4 py-2 text-xs font-medium transition disabled:opacity-50 ${
                      isSaved
                        ? "border-violet-400/30 bg-violet-500/15 text-violet-300"
                        : "border-white/10 text-slate-300 hover:border-violet-400/30 hover:bg-violet-500/10"
                    }`}
                  >
                    {isSaved ? "★ Saved" : "☆ Save chat"}
                  </button>
                </div>

                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-3 py-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                      <ZentrixLogo
                        size="small"
                        showName={false}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />

                      <span className="ml-2 text-xs text-slate-500">
                        ZENTRIX is thinking...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="relative z-10 shrink-0 border-t border-white/[0.06] bg-[#080817]/95 px-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl sm:px-6">
            <div className="mx-auto w-full max-w-4xl">
              <ChatInput
                onSend={onSend}
                onStop={onStop}
                disabled={isGenerating}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
  }
