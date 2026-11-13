import { api } from '../lib/api'
import type { ChatConversation, ChatMessage, ChatUnreadSummary } from '../types/chat'

function mapConversationFromApi(raw: any): ChatConversation {
  const lastMessage = raw.messages?.[0]
  const hasAttachmentsOnly = Boolean(lastMessage && !lastMessage.content && lastMessage._count?.attachments > 0)
  return {
    id: raw.id,
    customerId: raw.customer.id,
    customerName: raw.customer.fullName,
    customerCode: raw.customer.customerCode,
    lastMessageAt: raw.lastMessageAt,
    lastMessagePreview: hasAttachmentsOnly ? '📎 ไฟล์แนบ' : (lastMessage?.content ?? ''),
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
    attachments: (raw.attachments ?? []).map((a: any) => ({
      id: a.id,
      url: a.url,
      fileName: a.fileName,
      contentType: a.contentType,
      fileSizeBytes: a.fileSizeBytes,
    })),
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

export function getMyChatRepliesToday(): Promise<number> {
  return api.get<{ count: number }>('/chats/my-replies-today').then((res) => res.data.count)
}

export function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return api.get(`/chats/${conversationId}/messages`).then((res) => res.data.map(mapMessageFromApi))
}

export function sendMessage(conversationId: string, content: string, files: File[] = []): Promise<ChatMessage> {
  if (files.length === 0) {
    return api.post(`/chats/${conversationId}/messages`, { content }).then((res) => mapMessageFromApi(res.data))
  }
  const form = new FormData()
  form.append('content', content)
  files.forEach((file) => form.append('files', file))
  return api.post(`/chats/${conversationId}/messages`, form).then((res) => mapMessageFromApi(res.data))
}

export function markConversationRead(conversationId: string): Promise<void> {
  return api.put(`/chats/${conversationId}/read`).then(() => undefined)
}
