"use client";

import { useCallback, useEffect, useState } from "react";
import ChatInterface from "@/components/chat/chat-interface";
import type { ChatMessageData } from "@/components/chat/chat-message";
import type { ChatHistoryItem } from "@/components/layout/app-sidebar";
import {
  getConversations,
  saveConversations,
  toggleConversationSaved,
  type StoredConversation,
} from "@/lib/chat-storage";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { downloadMessageAsDocx } from "@/lib/docx/generate-docx";
import { downloadMessageAsPdf } from "@/lib/pdf/generate-pdf";

type ResponseStyle = "balanced" | "concise" | "detailed" | "creative";

interface GeneratedFile {
  type: "docx" | "pdf";
  title: string;
  content: string;
}

function extractGeneratedFile(text: string): GeneratedFile | null {
  const pattern =
    /\[\[ZENTRIX_FILE\s+type="(docx|pdf)"\s+title="([^"]+)"\]\]([\s\S]*?)\[\[\/ZENTRIX_FILE\]\]/i;

  const match = text.match(pattern);

  if (!match) return null;

  const content = match[3].trim();
  const title = match[2].trim();

  if (!content || !title) return null;

  return {
    type: match[1].toLowerCase() as "docx" | "pdf",
    title,
    content,
  };
}

function getVisibleStreamingText(text: string): string {
  const marker = "[[ZENTRIX_FILE";
  const markerIndex = text.indexOf(marker);

  if (markerIndex !== -1) {
    return text.slice(0, markerIndex).trim();
  }

  for (let i = 1; i < marker.length; i++) {
    if (text.endsWith(marker.slice(0, i))) {
      return text.slice(0, -i).trim();
    }
  }

  return text;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [responseStyle, setResponseStyle] =
    useState<ResponseStyle>("balanced");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    const stored = getConversations();
    setConversations(stored);

    const savedPreferences = localStorage.getItem("zentrix-ai-preferences");

    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);

        if (
          ["balanced", "concise", "detailed", "creative"].includes(
            preferences.responseStyle
          )
        ) {
          setResponseStyle(preferences.responseStyle);
        }
      } catch {
        // Keep default preferences.
      }
    }

    const params = new URLSearchParams(window.location.search);
    const requestedConversation = params.get("conversation");

    if (
      requestedConversation &&
      stored.some((item) => item.id === requestedConversation)
    ) {
      setActiveChatId(requestedConversation);
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) saveConversations(conversations);
  }, [conversations, storageReady]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeChatId
  );

  const messages = activeConversation?.messages ?? [];
  const isSaved = activeConversation?.saved ?? false;

  const chatHistory: ChatHistoryItem[] = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
  }));

  const handleNewChat = useCallback(() => {
    abortController?.abort();
    setAbortController(null);
    setIsGenerating(false);
    setError("");
    setActiveChatId(null);
    window.history.replaceState({}, "", "/chat");
  }, [abortController]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setError("");
    window.history.replaceState(
      {},
      "",
      `/chat?conversation=${encodeURIComponent(id)}`
    );
  }, []);

  function handleToggleSave() {
    if (!activeChatId || isGenerating) return;
    setConversations(toggleConversationSaved(activeChatId));
  }

  async function handleSend(message: string) {
    if (isGenerating || !storageReady) return;

    let conversationId = activeChatId;

    if (!conversationId) {
      conversationId = crypto.randomUUID();

      const newConversation: StoredConversation = {
        id: conversationId,
        title: message.length > 35 ? `${message.slice(0, 35)}...` : message,
        messages: [],
        updatedAt: new Date().toISOString(),
        saved: false,
      };

      setConversations((previous) => [newConversation, ...previous]);
      setActiveChatId(conversationId);

      window.history.replaceState(
        {},
        "",
        `/chat?conversation=${encodeURIComponent(conversationId)}`
      );
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

    const assistantId = crypto.randomUUID();
    let reply = "";
    let assistantAdded = false;

    function updateAssistant(content: string) {
      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;

          const existing = conversation.messages.filter(
            (item) => item.id !== assistantId
          );

          return {
            ...conversation,
            messages: [
              ...existing,
              {
                id: assistantId,
                role: "assistant",
                content,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );

      assistantAdded = true;
    }

    function processEvent(event: string) {
      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");

      if (!data || data === "[DONE]") return;

      let parsed: {
        choices?: Array<{
          delta?: { content?: string };
        }>;
        error?: { message?: string };
      };

      try {
        parsed = JSON.parse(data);
      } catch {
        return;
      }

      if (parsed.error?.message) {
        throw new Error(parsed.error.message);
      }

      const token = parsed.choices?.[0]?.delta?.content;

      if (typeof token === "string" && token.length > 0) {
        reply += token;

        const visibleText = getVisibleStreamingText(reply);

        if (visibleText) {
          updateAssistant(visibleText);
        }
      }
    }

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
          responseStyle,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.error || "Unable to generate a response. Please try again."
        );
      }

      if (!response.body) {
        throw new Error("Streaming is not supported by this connection.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          processEvent(event);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (controller.signal.aborted) return;

      if (!reply.trim()) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      // Detect and generate downloadable documents.
      const generatedFile = extractGeneratedFile(reply);

      if (generatedFile) {
        try {
          if (generatedFile.type === "docx") {
            await downloadMessageAsDocx(
              generatedFile.content,
              generatedFile.title
            );
          } else {
            downloadMessageAsPdf(
              generatedFile.title,
              generatedFile.content
            );
          }

          updateAssistant(
            `Your ${generatedFile.type === "docx" ? "Word document" : "PDF document"} **${generatedFile.title}** is ready. Your download should begin automatically.`
          );
        } catch (fileError) {
          console.error("ZENTRIX document generation error:", fileError);

          updateAssistant(
            `I prepared the content for **${generatedFile.title}**, but the file could not be generated. Please try requesting it again.`
          );

          setError("The document could not be generated. Please try again.");
        }
      } else {
        updateAssistant(reply);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );

      if (!reply && assistantAdded) {
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: conversation.messages.filter(
                    (item) => item.id !== assistantId
                  ),
                }
              : conversation
          )
        );
      }
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
        isSaved={isSaved}
        onToggleSave={handleToggleSave}
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
