import { api } from '../lib/api'
import type { ChatConversation, ChatMessage, ChatUnreadSummary } from '../types/chat'

function mapConversationFromApi(raw: any): ChatConversation {
  return {
    id: raw.id,
    customerId: raw.customer.id,
    customerName: raw.customer.fullName,
    customerCode: raw.customer.customerCode,
    lastMessageAt: raw.lastMessageAt,
    lastMessagePreview: raw.messages?.[0]?.content ?? '',
    unreadCount: raw.unreadCount,
  }
}

function mapMessageFromApi(raw: any): ChatMessage {
  return {
    id: raw.id,
    sender: raw.sender,
    content: raw.content,
    createdAt: raw.createdAt,
    senderAdminName: raw.senderAdmin ? `${raw.senderAdmin.firstName} ${raw.senderAdmin.lastName}` : null,
  }
}

export function getConversations(): Promise<ChatConversation[]> {
  return api.get('/chats').then((res) => res.data.map(mapConversationFromApi))
}

export function getConversation(conversationId: string): Promise<ChatConversation> {
  return api.get(`/chats/${conversationId}`).then((res) => mapConversationFromApi(res.data))
}

export function getUnreadChatSummary(): Promise<ChatUnreadSummary> {
  return api.get('/chats/unread-count').then((res) => res.data)
}

export function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return api.get(`/chats/${conversationId}/messages`).then((res) => res.data.map(mapMessageFromApi))
}

export function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  return api.post(`/chats/${conversationId}/messages`, { content }).then((res) => mapMessageFromApi(res.data))
}

export function markConversationRead(conversationId: string): Promise<void> {
  return api.put(`/chats/${conversationId}/read`).then(() => undefined)
}
