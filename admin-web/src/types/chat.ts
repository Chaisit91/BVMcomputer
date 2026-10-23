export type ChatSender = 'customer' | 'admin'

export interface ChatMessage {
  id: string
  sender: ChatSender
  content: string
  createdAt: string
  // Who actually sent an admin-side message — shown here in the back office
  // for accountability; a customer-facing surface would show the company's
  // name instead, never this.
  senderAdminName: string | null
}

export interface ChatConversation {
  id: string
  customerId: string
  customerName: string
  customerCode: string
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount: number
}

export interface ChatUnreadSummary {
  total: number
  soleConversationId: string | null
}
