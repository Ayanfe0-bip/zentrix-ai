"use client";

import { useEffect, useRef, useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import ChatMessage from "@/components/chat/chat-message";
import ChatInput from "@/components/chat/chat-input";
import type { ChatMessageData } from "@/components/chat/chat-message";
import type { ChatHistoryItem } from "@/components/layout/app-sidebar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

interface ChatInterfaceProps {
  messages: ChatMessageData[];
  onSend: (message: string) => void;
  onNewChat?: () => void;
  onSelectChat?: (id: string) => void;
  chats?: ChatHistoryItem[];
  isGenerating?: boolean;
  onStop?: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const suggestions = [
  {
    icon: "✦",
    title: "Creative writing",
    description: "Write, improve, and explore new ideas.",
    prompt: "Help me write something creative and engaging.",
  },
  {
    icon: "</>",
    title: "Write code",
    description: "Build applications and solve coding problems.",
    prompt: "Help me write and understand some code.",
  },
  {
    icon: "◈",
    title: "Learn something",
    description: "Understand complex topics more easily.",
    prompt: "Teach me something interesting step by step.",
  },
  {
    icon: "⌘",
    title: "Solve a problem",
    description: "Think through challenges and find solutions.",
    prompt: "Help me solve a problem step by step.",
  },
];

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
}: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[#070817] text-white">
      <AppSidebar
        activeItem="AI Chat"
        chats={chats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={onSelectChat}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="AI Chat"
          subtitle="Your intelligent workspace"
          modelName={selectedModel}
          onModelChange={onModelChange}
          onMenuClick={() => setSidebarOpen(true)}
          onNewChat={handleNewChat}
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/[0.06] blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/[0.04] blur-[120px]" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center px-5 py-12">
                <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 shadow-2xl shadow-violet-950/30">
                  <div className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-xl" />

                  <span className="relative bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-4xl font-bold text-transparent">
                    Z
                  </span>
                </div>

                <div className="max-w-2xl text-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
                    Think Beyond. Build Without Limits.
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    What can I help you
                    <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                      accomplish today?
                    </span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-400">
                    Explore ideas, write code, solve problems, and turn
                    your imagination into something extraordinary.
                  </p>
                </div>

                <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => onSend(suggestion.prompt)}
                      className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-300 transition group-hover:border-cyan-400/30 group-hover:text-cyan-300">
                        {suggestion.icon}
                      </div>

                      <h3 className="text-sm font-semibold text-white">
                        {suggestion.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {suggestion.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-8">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-3 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
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

          <div className="relative border-t border-white/[0.06] bg-[#070817]/90 px-4 pb-4 pt-4 backdrop-blur-xl sm:px-8">
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
