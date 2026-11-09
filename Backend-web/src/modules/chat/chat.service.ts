import { chatRepository, type IncomingAttachment } from './chat.repository'

export const chatService = {
  listConversations: () => chatRepository.findConversations(),
  getConversation: (conversationId: string) => chatRepository.findById(conversationId),
  getMessages: (conversationId: string) => chatRepository.findMessages(conversationId),
  reply: (conversationId: string, adminId: string, content: string, attachments: IncomingAttachment[] = []) =>
    chatRepository.appendMessage(conversationId, 'admin', content, adminId, attachments),
  markRead: (conversationId: string) => chatRepository.markRead(conversationId),
  unreadSummary: () => chatRepository.unreadSummary(),
  // Called by the public (no-auth) endpoint once the storefront exists.
  // First message from a given customer opens their one running thread.
  receiveFromCustomer: async (customerId: string, content: string, attachments: IncomingAttachment[] = []) => {
    const conversation =
      (await chatRepository.findByCustomerId(customerId)) ?? (await chatRepository.createConversation(customerId))
    return chatRepository.appendMessage(conversation.id, 'customer', content, undefined, attachments)
  },
}
