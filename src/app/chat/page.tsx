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
import { saveGeneratedImage } from "@/lib/image-storage";

type ResponseStyle =
  | "balanced"
  | "concise"
  | "detailed"
  | "creative";

interface GeneratedFile {
  type: "docx" | "pdf";
  title: string;
  content: string;
}

interface GeneratedImageResult {
  success: boolean;
  image: string;
  mediaType: string;
  model: string;
  resolution: string;
  aspectRatio: string;
  cost: number | null;
  error?: string;
}

/* DOCUMENT MARKER EXTRACTION */

function extractGeneratedFile(text: string): GeneratedFile | null {
  const marker = "[[ZENTRIX_FILE";
  const closingMarker = "[[/ZENTRIX_FILE]]";

  const startIndex = text.indexOf(marker);

  if (startIndex === -1) return null;

  const headerEnd = text.indexOf("]]", startIndex);

  if (headerEnd === -1) return null;

  const closingIndex = text.indexOf(
    closingMarker,
    headerEnd + 2
  );

  if (closingIndex === -1) return null;

  const header = text.slice(startIndex, headerEnd);

  const content = text
    .slice(headerEnd + 2, closingIndex)
    .trim();

  const type: "pdf" | "docx" =
    header.includes('type="pdf"') ? "pdf" : "docx";

  const titleStart = header.indexOf('title="');

  if (titleStart === -1 || !content) return null;

  const titleValueStart = titleStart + 7;

  const titleEnd = header.indexOf('"', titleValueStart);

  if (titleEnd === -1) return null;

  const title = header
    .slice(titleValueStart, titleEnd)
    .trim();

  if (!title) return null;

  return {
    type,
    title,
    content,
  };
}

/* HIDE INCOMPLETE DOCUMENT MARKERS DURING STREAMING */

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

/* IMAGE REQUEST DETECTION */

function isImageGenerationRequest(message: string): boolean {
  const text = message.toLowerCase();

  const documentRequest =
    /\b(pdf|docx|word document|spreadsheet|excel file|powerpoint|presentation|report document)\b/i.test(
      text
    );

  if (documentRequest) return false;

  const action =
    /\b(create|generate|make|draw|design|produce|render|illustrate|paint|craft)\b/i;

  const imageType =
    /\b(image|picture|photo|photograph|portrait|flyer|poster|banner|logo|illustration|artwork|wallpaper|thumbnail|graphic|advert|advertisement|product shot|product image|cover art)\b/i;

  return action.test(text) && imageType.test(text);
}

/* MAIN CHAT PAGE */

export default function ChatPage() {
  const [conversations, setConversations] = useState<
    StoredConversation[]
  >([]);

  const [storageReady, setStorageReady] = useState(false);

  const [activeChatId, setActiveChatId] = useState<string | null>(
    null
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const [error, setError] = useState("");

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const [responseStyle, setResponseStyle] =
    useState<ResponseStyle>("balanced");

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  /* LOAD CHAT HISTORY */

  useEffect(() => {
    const stored = getConversations();

    setConversations(stored);

    const savedPreferences = localStorage.getItem(
      "zentrix-ai-preferences"
    );

    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);

        if (
          [
            "balanced",
            "concise",
            "detailed",
            "creative",
          ].includes(preferences.responseStyle)
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

  /* SAVE CHAT HISTORY */

  useEffect(() => {
    if (storageReady) {
      saveConversations(conversations);
    }
  }, [conversations, storageReady]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeChatId
  );

  const messages = activeConversation?.messages ?? [];

  const isSaved = activeConversation?.saved ?? false;

  const chatHistory: ChatHistoryItem[] = conversations.map(
    (conversation) => ({
      id: conversation.id,
      title: conversation.title,
    })
  );

  /* CREATE NEW CHAT */

  const handleNewChat = useCallback(() => {
    abortController?.abort();

    setAbortController(null);
    setIsGenerating(false);
    setError("");
    setActiveChatId(null);

    window.history.replaceState({}, "", "/chat");
  }, [abortController]);

  /* SELECT EXISTING CHAT */

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setError("");

    window.history.replaceState(
      {},
      "",
      `/chat?conversation=${encodeURIComponent(id)}`
    );
  }, []);

  /* SAVE OR UNSAVE CONVERSATION */

  function handleToggleSave() {
    if (!activeChatId || isGenerating) return;

    setConversations(
      toggleConversationSaved(activeChatId)
    );
  }

  /* SEND MESSAGE */

  async function handleSend(
  message: string,
  images: string[] = []
) {
    if (isGenerating || !storageReady) return;

    const imageEditRequest =
  images.length > 0 &&
  /\b(edit|change|transform|replace|remove|retouch|enhance|modify|redesign|background|recolor|restore)\b/i.test(message);

const imageRequest =
  isImageGenerationRequest(message) || imageEditRequest;

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

      window.history.replaceState(
        {},
        "",
        `/chat?conversation=${encodeURIComponent(
          conversationId
        )}`
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
  attachments: images,
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

    /* UPDATE ASSISTANT MESSAGE */

    function updateAssistant(
      content: string,
      image?: ChatMessageData["image"]
    ) {
      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }

          const existing = conversation.messages.filter(
            (item) => item.id !== assistantId
          );

          const assistantMessage: ChatMessageData = {
            id: assistantId,
            role: "assistant",
            content,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            ...(image ? { image } : {}),
          };

          return {
            ...conversation,
            messages: [
              ...existing,
              assistantMessage,
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );

      assistantAdded = true;
    }

    try {
      /* ==================================
         IMAGE GENERATION
      ================================== */

      if (imageRequest) {
        updateAssistant(
          "I'm creating your image. This may take a little while..."
        );

        const response = await fetch(
          "/api/images/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
  prompt: message,
  resolution: "768",
  aspectRatio: "1:1",
  images,
}),
            signal: controller.signal,
          }
        );

        const result =
          (await response.json()) as GeneratedImageResult;

        if (
          !response.ok ||
          !result.success ||
          !result.image
        ) {
          throw new Error(
            result.error ||
              "Unable to generate your image. Please try again."
          );
        }

        if (controller.signal.aborted) return;

        const imageId = await saveGeneratedImage(
          result.image,
          result.mediaType || "image/png"
        );

        if (controller.signal.aborted) return;

        updateAssistant(
          "Your image is ready! You can enlarge it, retouch it, or download it.",
          {
            id: imageId,
            prompt: message,
            mediaType: result.mediaType || "image/png",
          }
        );

        return;
      }

      /* ==================================
         NORMAL AI CHAT
      ================================== */

              // Understand uploaded images after the user sends the message.
      const messagesForAI = updatedMessages.map((item) => ({
        role: item.role,
        content: item.content,
      }));

      if (images.length > 0) {
        const imageDescriptions: string[] = [];

        for (let index = 0; index < images.length; index++) {
          const imageBlob = await fetch(images[index]).then((res) =>
            res.blob()
          );

          const formData = new FormData();

          formData.append(
            "file",
            new File(
              [imageBlob],
              `uploaded-image-${index + 1}.jpg`,
              { type: imageBlob.type || "image/jpeg" }
            )
          );

          const visionResponse = await fetch("/api/vision", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          const visionResult = await visionResponse.json();

          if (!visionResponse.ok || !visionResult.success) {
            throw new Error(
              visionResult.error || "Unable to understand the uploaded image."
            );
          }

          imageDescriptions.push(
            `Image ${index + 1} description:\n${visionResult.text}`
          );
        }

        const latestMessage = messagesForAI[messagesForAI.length - 1];

        latestMessage.content +=
          "\n\n[UPLOADED IMAGE INFORMATION]\n" +
          imageDescriptions.join("\n\n");
      }
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAI,
          model: selectedModel,
          responseStyle,
        }),
        signal: controller.signal,
      });

      if (!chatResponse.ok) {
        const result = await chatResponse
          .json()
          .catch(() => ({}));

        throw new Error(
          result.error ||
            "Unable to generate a response. Please try again."
        );
      }

      if (!chatResponse.body) {
        throw new Error(
          "Streaming is not supported by this connection."
        );
      }

      const reader = chatResponse.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      /* PROCESS STREAMING EVENTS */

      function processEvent(event: string) {
        const data = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");

        if (!data || data === "[DONE]") return;

        let parsed: {
          choices?: Array<{
            delta?: {
              content?: string;
            };
          }>;
          error?: {
            message?: string;
          };
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

        if (
          typeof token === "string" &&
          token.length > 0
        ) {
          reply += token;

          const visibleText =
            getVisibleStreamingText(reply);

          if (visibleText) {
            updateAssistant(visibleText);
          }
        }
      }

      /* READ STREAM */

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        buffer = buffer
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n");

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
        throw new Error(
          "The AI returned an empty response. Please try again."
        );
      }

      /* ==================================
         DOCUMENT GENERATION
      ================================== */

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
            `Your ${
              generatedFile.type === "docx"
                ? "Word document"
                : "PDF document"
            } **${generatedFile.title}** is ready. Your download should begin automatically.`
          );
        } catch (fileError) {
          console.error(
            "ZENTRIX document generation error:",
            fileError
          );

          updateAssistant(
            `I prepared the content for **${generatedFile.title}**, but the file could not be generated. Please try requesting it again.`
          );

          setError(
            "The document could not be generated. Please try again."
          );
        }
      } else {
        updateAssistant(reply);
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "AbortError"
      ) {
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

  /* STOP GENERATION */

  function handleStop() {
    abortController?.abort();

    setAbortController(null);
    setIsGenerating(false);
  }

  /* PAGE UI */

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
