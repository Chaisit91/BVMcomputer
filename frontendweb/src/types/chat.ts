import type { UpgradeSpecFieldId } from '../data/upgradeSpecFields';

/** Real support availability, as reported by the backend. */
export interface SupportStatus {
  availability: 'online' | 'offline';
  /** Typical reply time right now, if the backend knows it. */
  replyTimeMinutes?: number;
}

export type ChatSender = 'customer' | 'admin';

/** One line of a shared PC spec — only fields the customer filled in and agreed to send. */
export interface SharedSpecItem {
  field: UpgradeSpecFieldId;
  label: string;
  value: string;
  /** Set for parts picked from the catalog, so the admin can look the exact product up. */
  productId?: string;
  sku?: string;
}

/** A message as stored by the backend. */
export interface ChatMessage {
  id: string;
  sender: ChatSender;
  createdAt: string;
  text?: string;
  spec?: SharedSpecItem[];
}

export type SendChatMessageBody = { text: string } | { spec: SharedSpecItem[] };

/**
 * - live: connected to the real support backend.
 * - demo: backend unreachable (or API_MODE=mock) — messages stay in this browser only and nobody replies.
 */
export type ChatMode = 'live' | 'demo';

export interface ChatSession {
  mode: ChatMode;
  status: SupportStatus | null;
  conversationId: string | null;
  messages: ChatMessage[];
}
