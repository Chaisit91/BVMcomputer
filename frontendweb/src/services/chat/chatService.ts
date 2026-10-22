import { apiGet, apiPost, withMockFallback } from '../../api/request';
import type { ChatMessage, ChatSession, SendChatMessageBody, SupportStatus } from '../../types/chat';

/*
 * Support-chat backend contract (REST + polling for now; a WebSocket/SSE or third-party
 * live-chat SDK can replace the polling later without touching the UI):
 *
 *   GET  /support/status                               -> SupportStatus
 *   POST /support/conversations { conversationId? }    -> { id }   create, or resume the given one
 *   GET  /support/conversations/{id}/messages?after=   -> ChatMessage[] (oldest first)
 *   POST /support/conversations/{id}/messages          -> ChatMessage  body: SendChatMessageBody
 *
 * The backend identifies the customer from the auth cookie/token when logged in; guests are
 * tied to the conversation id below, which the backend must treat as an access credential.
 */

const CONVERSATION_KEY = 'bvm.supportChat.conversationId';

function loadConversationId(): string | null {
  try {
    return window.localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function saveConversationId(id: string): void {
  try {
    window.localStorage.setItem(CONVERSATION_KEY, id);
  } catch {
    // The conversation just won't be resumed after a reload.
  }
}

const messagesUrl = (conversationId: string) => `/support/conversations/${encodeURIComponent(conversationId)}/messages`;

/**
 * Open (or resume) the customer's conversation and load its history. Falls back to demo mode
 * only when the backend can't be reached at all (API_MODE auto/mock) — a demo session never
 * pretends to be online and never produces admin replies.
 */
export function connectSupportChat(): Promise<ChatSession> {
  return withMockFallback<ChatSession>(
    'POST /support/conversations',
    async () => {
      // Status and conversation don't depend on each other — fetch in parallel.
      const [status, conversation] = await Promise.all([
        apiGet<SupportStatus>('/support/status'),
        apiPost<{ id: string }>('/support/conversations', { conversationId: loadConversationId() }),
      ]);
      saveConversationId(conversation.id);
      const messages = await apiGet<ChatMessage[]>(messagesUrl(conversation.id));
      return { mode: 'live' as const, status, conversationId: conversation.id, messages };
    },
    () => ({ mode: 'demo' as const, status: null, conversationId: null, messages: [] }),
  );
}

// Live-session calls below deliberately skip the mock fallback: once a real conversation is
// open, a failed send must show as failed (with retry), never quietly turn into a fake success.

export function sendSupportMessage(conversationId: string, body: SendChatMessageBody): Promise<ChatMessage> {
  return apiPost<ChatMessage>(messagesUrl(conversationId), body);
}

export function fetchSupportMessages(conversationId: string, afterId?: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(messagesUrl(conversationId), afterId ? { after: afterId } : undefined);
}

export function fetchSupportStatus(): Promise<SupportStatus> {
  return apiGet<SupportStatus>('/support/status');
}
