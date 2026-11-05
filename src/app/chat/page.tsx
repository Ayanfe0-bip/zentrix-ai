"use client";

import { useCallback, useEffect, useState } from "react";
import ChatInterface from "@/components/chat/chat-interface";
import type { ChatMessageData } from "@/components/chat/chat-message";
import type { ChatHistoryItem } from "@/components/layout/app-sidebar";
import {
  getConversations,
  saveConversations,
  type StoredConversation,
} from "@/lib/chat-storage";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export default function ChatPage() {
  const [conversations, setConversations] = useState<
    StoredConversation[]
  >([]);
  const [storageReady, setStorageReady] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    const stored = getConversations();

    setConversations(stored);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    saveConversations(conversations);
  }, [conversations, storageReady]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeChatId
  );

  const messages = activeConversation?.messages ?? [];

  const chatHistory: ChatHistoryItem[] = conversations.map(
    (conversation) => ({
      id: conversation.id,
      title: conversation.title,
    })
  );

  const handleNewChat = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }

    setIsGenerating(false);
    setError("");
    setActiveChatId(null);
  }, [abortController]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setError("");
  }, []);

  async function handleSend(message: string) {
    if (isGenerating || !storageReady) return;

    let conversationId = activeChatId;

    if (!conversationId) {
      conversationId = crypto.randomUUID();

      const newConversation: StoredConversation = {
        id: conversationId,
        title:
          message.length > 35
            ? `${message.slice(0, 35)}...`
            : message,
        messages: [],
        updatedAt: new Date().toISOString(),
        saved: false,
      };

      setConversations((previous) => [
        newConversation,
        ...previous,
      ]);

      setActiveChatId(conversationId);
    }

    const userMessage: ChatMessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [
      ...(activeConversation?.messages ?? []),
      userMessage,
    ];

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            }
          : conversation
      )
    );

    setError("");
    setIsGenerating(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          model: selectedModel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.error ||
            "Unable to generate a response. Please try again."
        );
      }

      const result = await response.json();

      if (!result.reply || typeof result.reply !== "string") {
        throw new Error("The AI returned an invalid response.");
      }

      const assistantMessage: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  assistantMessage,
                ],
                updatedAt: new Date().toISOString(),
              }
            : conversation
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  }

  function handleStop() {
    abortController?.abort();
    setAbortController(null);
    setIsGenerating(false);
  }

  return (
    <div className="relative h-[100dvh]">
      <ChatInterface
        messages={messages}
        chats={chatHistory}
        onSend={handleSend}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        isGenerating={isGenerating}
        onStop={handleStop}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {error && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 z-[110] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-xl border border-red-400/20 bg-[#21121b] px-4 py-3 text-sm text-red-300 shadow-2xl"
        >
          {error}
        </div>
      )}
    </div>
  );
    }
