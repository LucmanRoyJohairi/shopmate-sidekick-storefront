import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";

import { getCartSummary } from "@/stores/cartStore";
import { openAssistant } from "@/stores/uiStore";

const STORAGE_KEY = "ordo-concierge-chat";
const CHAT_ID = "ordo-concierge";

let chat: Chat<UIMessage> | null = null;

export function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: UIMessage[]) {
  try {
    if (messages.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable — the chat still works for this session.
  }
}

/** One shared conversation for the whole site (client only). */
export function getAssistantChat(): Chat<UIMessage> {
  if (!chat) {
    chat = new Chat<UIMessage>({
      id: CHAT_ID,
      messages: loadStoredMessages(),
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: CHAT_ID, cart: getCartSummary() }),
      }),
      onError: (error) => {
        toast.error("The concierge couldn't answer", {
          description: error.message || "Please check your connection and try again.",
        });
      },
    });
  }
  return chat;
}

/** Open the assistant and send a question on the shopper's behalf. */
export function askConcierge(text: string) {
  openAssistant();
  const c = getAssistantChat();
  if (c.status === "submitted" || c.status === "streaming") return;
  void c.sendMessage({ text });
}
