import { chatRepository } from './chat.repository'

export const chatService = {
  listConversations: () => chatRepository.findConversations(),
  getConversation: (conversationId: string) => chatRepository.findById(conversationId),
  getMessages: (conversationId: string) => chatRepository.findMessages(conversationId),
  reply: (conversationId: string, adminId: string, content: string) =>
    chatRepository.appendMessage(conversationId, 'admin', content, adminId),
  markRead: (conversationId: string) => chatRepository.markRead(conversationId),
  unreadSummary: () => chatRepository.unreadSummary(),
  // Called by the public (no-auth) endpoint once the storefront exists.
  // First message from a given customer opens their one running thread.
  receiveFromCustomer: async (customerId: string, content: string) => {
    const conversation =
      (await chatRepository.findByCustomerId(customerId)) ?? (await chatRepository.createConversation(customerId))
    return chatRepository.appendMessage(conversation.id, 'customer', content)
  },
}
