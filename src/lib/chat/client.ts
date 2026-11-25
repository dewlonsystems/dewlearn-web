import { CONSENT_EVENT, hasConsent } from "@/lib/consent";
import { confirmAction } from "@/lib/ui/confirm";
import { renderRichText } from "./format";
import * as store from "./store";
import type { ChatMessage } from "./store";

const GREETING = "Hey there! I'm Dewi, Dewlon Systems' AI assistant. How can I help you today?";
const FALLBACK_ERROR =
  "I couldn't reach the server. Please check your connection and try again, or email contact@dewlons.com.";
const UNANSWERED = "This message didn't get a reply.";
const MAX_SENT = 20;

export function initChat(root: HTMLElement): void {
  const chatId = root.dataset.chatId;
  if (!chatId) return;

  const q = <T extends Element>(selector: string): T => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`Chat UI: missing ${selector}`);
    return el;
  };
  const clone = (name: string) =>
    q<HTMLTemplateElement>(`template[data-tpl="${name}"]`).content.firstElementChild!.cloneNode(true) as HTMLElement;

  const scroller = q<HTMLElement>("[data-scroller]");
  const thread = q<HTMLElement>("[data-thread]");
  const suggestions = q<HTMLElement>("[data-suggestions]");
  const form = q<HTMLFormElement>("[data-composer]");
  const input = q<HTMLTextAreaElement>("[data-input]");
  const sendBtn = q<HTMLButtonElement>("[data-send]");
  const list = q<HTMLElement>("[data-chat-list]");
  const emptyNote = q<HTMLElement>("[data-empty]");
  const noteSaved = q<HTMLElement>("[data-note-saved]");
  const noteSession = q<HTMLElement>("[data-note-session]");
  const sidebar = q<HTMLElement>("[data-sidebar]");
  const backdrop = q<HTMLElement>("[data-sidebar-backdrop]");
  const menuButton = q<HTMLButtonElement>("header [data-sidebar-toggle]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 64rem)");

  let messages: ChatMessage[] = store.loadMessages(chatId);
  if (messages.length === 0) messages = [{ role: "assistant", content: GREETING }];

  let loading = false;
  let typingEl: HTMLElement | null = null;
  let errorEl: HTMLElement | null = null;

  /* ───────── Thread ───────── */

  const scrollToEnd = (instant = false) =>
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: instant || reduceMotion.matches ? "auto" : "smooth",
    });

  const appendMessage = (m: ChatMessage) => {
    const el = clone(m.role === "user" ? "user" : "assistant");
    const content = el.querySelector<HTMLElement>("[data-content]")!;
    if (m.role === "user") content.textContent = m.content;
    else content.append(renderRichText(m.content));
    thread.append(el);
  };

  const showError = (text: string) => {
    errorEl?.remove();
    errorEl = clone("error");
    errorEl.querySelector<HTMLElement>("[data-message]")!.textContent = text;
    thread.append(errorEl);
    scrollToEnd();
  };

  const syncSend = () => {
    sendBtn.disabled = loading || input.value.trim().length === 0;
  };

  const autosize = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  };

  const setLoading = (value: boolean) => {
    loading = value;
    form.setAttribute("aria-busy", String(value));
    if (value) {
      typingEl = clone("typing");
      thread.append(typingEl);
    } else {
      typingEl?.remove();
      typingEl = null;
    }
    syncSend();
    scrollToEnd();
  };

  const requestReply = async () => {
    errorEl?.remove();
    errorEl = null;
    setLoading(true);

    let reply: string | null = null;
    let failure = FALLBACK_ERROR;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.slice(-MAX_SENT) }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && typeof data.text === "string") reply = data.text;
      else if (typeof data?.error === "string") failure = data.error;
    } catch {
      /* network error or timeout: keep the fallback message */
    }

    setLoading(false);

    if (reply !== null) {
      const message: ChatMessage = { role: "assistant", content: reply };
      messages.push(message);
      store.saveChat(chatId, messages);
      appendMessage(message);
      scrollToEnd();
    } else {
      showError(failure);
    }
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    const message: ChatMessage = { role: "user", content: text };
    messages.push(message);
    store.saveChat(chatId, messages);
    appendMessage(message);

    suggestions.hidden = true;
    input.value = "";
    autosize();
    renderList();
    void requestReply();
  };

  /* ───────── Sidebar ───────── */

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
  };

  function renderList() {
    const chats = store.listChats();
    list.replaceChildren();
    emptyNote.hidden = chats.length > 0;

    for (const chat of chats) {
      const item = clone("chat-item");
      const link = item.querySelector<HTMLAnchorElement>("[data-link]")!;
      link.href = `/chat/${chat.id}`;
      if (chat.id === chatId) link.setAttribute("aria-current", "page");
      item.querySelector<HTMLElement>("[data-title]")!.textContent = chat.title;
      item.querySelector<HTMLElement>("[data-time]")!.textContent = formatTime(chat.updatedAt);
      item.querySelector<HTMLElement>("[data-delete]")!.dataset.id = chat.id;
      list.append(item);
    }
  }

  const syncStorageNote = () => {
    const persistent = hasConsent("functional");
    noteSaved.hidden = !persistent;
    noteSession.hidden = persistent;
  };

  const setSidebar = (open: boolean) => {
    sidebar.toggleAttribute("data-open", open);
    backdrop.hidden = !open;
    root.querySelectorAll("[data-sidebar-toggle]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
    sidebar.inert = !desktop.matches && !open;
  };

  /* ───────── Events ───────── */

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send(input.value);
  });

  input.addEventListener("input", () => {
    autosize();
    syncSend();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  root.addEventListener("click", async (event) => {
    const target = event.target as Element;

    const suggestion = target.closest<HTMLElement>("[data-suggestion]");
    if (suggestion) return send(suggestion.textContent ?? "");

    if (target.closest("[data-retry]") && !loading) return void requestReply();

    if (target.closest("[data-clear-all]")) {
      const ok = await confirmAction({
        title: "Delete all chats?",
        message: "This removes every saved conversation on this device.",
        confirmLabel: "Delete all",
        tone: "danger",
      });
      if (ok) {
        store.clearAllChats();
        location.assign("/chat");
      }
      return;
    }

    const del = target.closest<HTMLElement>("[data-delete]");
    if (del?.dataset.id) {
      const ok = await confirmAction({
        title: "Delete this chat?",
        message: "This conversation will be removed from this device.",
        confirmLabel: "Delete",
        tone: "danger",
      });
      if (!ok) return;
      store.deleteChat(del.dataset.id);
      if (del.dataset.id === chatId) location.assign("/chat");
      else renderList();
      return;
    }

    if (target.closest("[data-sidebar-toggle]")) {
      const open = !sidebar.hasAttribute("data-open");
      setSidebar(open);
      if (open) sidebar.querySelector<HTMLElement>("a")?.focus();
      else menuButton.focus();
      return;
    }

    if (target.closest("[data-sidebar-backdrop]")) setSidebar(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.hasAttribute("data-open")) {
      setSidebar(false);
      menuButton.focus();
    }
  });

  desktop.addEventListener("change", () => setSidebar(false));

  window.addEventListener(CONSENT_EVENT, () => {
    if (hasConsent("functional")) {
      if (messages.length > 1) store.saveChat(chatId, messages); // move this chat to long-term storage
    } else {
      store.purgePersistent();
    }
    syncStorageNote();
    renderList();
  });

  /* ───────── Start ───────── */

  messages.forEach(appendMessage);
  suggestions.hidden = messages.length > 1;
  if (messages.at(-1)?.role === "user") showError(UNANSWERED); // e.g. they left mid-reply

  renderList();
  syncStorageNote();
  setSidebar(false);
  syncSend();
  scrollToEnd(true);

  if (window.matchMedia("(hover: hover)").matches) input.focus(); // don't pop the keyboard on phones
}