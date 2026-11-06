import type { ChatMessageData } from "@/components/chat/chat-message";

export interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessageData[];
  updatedAt: string;
  saved: boolean;
}

const STORAGE_KEY = "zentrix-ai-conversations";
const STORAGE_VERSION = 1;
const MAX_CONVERSATIONS = 200;

interface StorageData {
  version: number;
  conversations: StoredConversation[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeConversation(
  value: unknown
): StoredConversation | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<StoredConversation>;

  if (
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    !Array.isArray(item.messages)
  ) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    messages: item.messages,
    updatedAt:
      typeof item.updatedAt === "string"
        ? item.updatedAt
        : new Date().toISOString(),
    saved: item.saved === true,
  };
}

/**
 * Retrieve all conversations, newest first.
 */
export function getConversations(): StoredConversation[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const data = JSON.parse(raw) as StorageData;

    if (
      data.version !== STORAGE_VERSION ||
      !Array.isArray(data.conversations)
    ) {
      return [];
    }

    return data.conversations
      .map(normalizeConversation)
      .filter(
        (item): item is StoredConversation => item !== null
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );
  } catch {
    return [];
  }
}

/**
 * Save all conversations.
 */
export function saveConversations(
  conversations: StoredConversation[]
): boolean {
  if (!isBrowser()) return false;

  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      conversations: conversations
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        .slice(0, MAX_CONVERSATIONS),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Save or update one conversation.
 */
export function saveConversation(
  conversation: StoredConversation
): boolean {
  const conversations = getConversations();

  const updated = [
    conversation,
    ...conversations.filter(
      (item) => item.id !== conversation.id
    ),
  ];

  return saveConversations(updated);
}

/**
 * Find a conversation by its ID.
 */
export function getConversationById(
  id: string
): StoredConversation | undefined {
  return getConversations().find(
    (conversation) => conversation.id === id
  );
}

/**
 * Search conversation titles and message content.
 */
export function searchConversations(
  query: string
): StoredConversation[] {
  const normalizedQuery = query.trim().toLowerCase();

  const conversations = getConversations();

  if (!normalizedQuery) return conversations;

  return conversations.filter((conversation) => {
    const titleMatches = conversation.title
      .toLowerCase()
      .includes(normalizedQuery);

    const messageMatches = conversation.messages.some(
      (message) =>
        message.content
          .toLowerCase()
          .includes(normalizedQuery)
    );

    return titleMatches || messageMatches;
  });
}

/**
 * Rename a conversation.
 */
export function renameConversation(
  id: string,
  newTitle: string
): boolean {
  const title = newTitle.trim();

  if (!title) return false;

  const conversations = getConversations();

  const updated = conversations.map((conversation) =>
    conversation.id === id
      ? {
          ...conversation,
          title: title.slice(0, 100),
        }
      : conversation
  );

  return saveConversations(updated);
}

/**
 * Delete one conversation.
 */
export function deleteConversation(
  id: string
): boolean {
  const conversations = getConversations();

  return saveConversations(
    conversations.filter(
      (conversation) => conversation.id !== id
    )
  );
}

/**
 * Delete all conversations, including saved chats.
 */
export function deleteAllConversations(): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Toggle the saved status of a conversation.
 */
export function toggleConversationSaved(
  id: string
): StoredConversation[] {
  const conversations = getConversations();

  const updated = conversations.map((conversation) =>
    conversation.id === id
      ? {
          ...conversation,
          saved: !conversation.saved,
        }
      : conversation
  );

  saveConversations(updated);

  return updated;
}

/**
 * Retrieve bookmarked conversations only.
 */
export function getSavedConversations(): StoredConversation[] {
  return getConversations().filter(
    (conversation) => conversation.saved
  );
}

/**
 * Retrieve conversations that are not bookmarked.
 */
export function getChatHistory(): StoredConversation[] {
  return getConversations();
}

/**
 * Clear conversation history.
 * Preserves the existing saved conversations.
 */
export function clearConversationHistory(): boolean {
  const savedConversations = getConversations().filter(
    (conversation) => conversation.saved
  );

  return saveConversations(savedConversations);
      }
