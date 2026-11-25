import { hasConsent } from "@/lib/consent";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatMeta {
  id: string;
  title: string;
  updatedAt: number;
}

const INDEX_KEY = "dewlon-chats";
const MESSAGES_PREFIX = "dewlon-chat:";
const MAX_CHATS = 30;

const area = (): Storage => (hasConsent("functional") ? localStorage : sessionStorage);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = area().getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    area().setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the chat still works for this page view */
  }
}

function removeKey(key: string): void {
  try {
    area().removeItem(key);
  } catch {
    /* ignore */
  }
}

const isMessage = (m: unknown): m is ChatMessage =>
  typeof m === "object" &&
  m !== null &&
  ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
  typeof (m as ChatMessage).content === "string";

export function listChats(): ChatMeta[] {
  return readJson<ChatMeta[]>(INDEX_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadMessages(id: string): ChatMessage[] {
  const data = readJson<unknown>(MESSAGES_PREFIX + id, []);
  return Array.isArray(data) ? data.filter(isMessage) : [];
}

/** Saves a chat once the visitor has actually sent something. */
export function saveChat(id: string, messages: ChatMessage[]): void {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return;

  const title = firstUser.content.replace(/\s+/g, " ").slice(0, 60);
  const index = [{ id, title, updatedAt: Date.now() }, ...listChats().filter((c) => c.id !== id)];

  index.slice(MAX_CHATS).forEach((c) => removeKey(MESSAGES_PREFIX + c.id));
  writeJson(MESSAGES_PREFIX + id, messages);
  writeJson(INDEX_KEY, index.slice(0, MAX_CHATS));
}

export function deleteChat(id: string): void {
  removeKey(MESSAGES_PREFIX + id);
  writeJson(INDEX_KEY, listChats().filter((c) => c.id !== id));
}

export function clearAllChats(): void {
  listChats().forEach((c) => removeKey(MESSAGES_PREFIX + c.id));
  removeKey(INDEX_KEY);
}

/** Called when a visitor withdraws Functional consent: wipes anything saved long-term. */
export function purgePersistent(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k === INDEX_KEY || k.startsWith(MESSAGES_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}