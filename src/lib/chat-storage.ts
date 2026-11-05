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
const MAX_CONVERSATIONS = 50;

interface StorageData {
  version: number;
  conversations: StoredConversation[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

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

    return data.conversations;
  } catch {
    return [];
  }
}

export function saveConversations(
  conversations: StoredConversation[]
): boolean {
  if (!isBrowser()) return false;

  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      conversations: conversations.slice(0, MAX_CONVERSATIONS),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return true;
  } catch {
    return false;
  }
}

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

export function deleteConversation(id: string): boolean {
  const conversations = getConversations();

  return saveConversations(
    conversations.filter((item) => item.id !== id)
  );
}

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

export function getSavedConversations(): StoredConversation[] {
  return getConversations().filter(
    (conversation) => conversation.saved
  );
}

export function clearConversationHistory(): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
