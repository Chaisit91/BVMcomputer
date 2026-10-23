import { prisma } from '../../lib/prisma'
import type { ChatSender } from '../../../generated/prisma'

const adminSelect = { select: { id: true, firstName: true, lastName: true } }
const customerSelect = { select: { id: true, fullName: true, customerCode: true } }

export const chatRepository = {
  findConversations: () =>
    prisma.chatConversation.findMany({
      include: {
        customer: customerSelect,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    }),
  findByCustomerId: (customerId: string) => prisma.chatConversation.findUnique({ where: { customerId } }),
  findById: (id: string) =>
    prisma.chatConversation.findUnique({
      where: { id },
      include: { customer: customerSelect },
    }),
  // senderAdmin is included so the back office can always tell which admin
  // actually sent a given reply, even though a customer-facing surface would
  // show the company's name instead.
  findMessages: (conversationId: string) =>
    prisma.chatMessage.findMany({
      where: { conversationId },
      include: { senderAdmin: adminSelect },
      orderBy: { createdAt: 'asc' },
    }),
  createConversation: (customerId: string) => prisma.chatConversation.create({ data: { customerId } }),
  // Customer messages bump unreadCount; an admin reply always resets it back
  // to 0 (the thread is caught up as of the admin's own reply). Any admin can
  // reply to any conversation — there's no ownership/claim to check.
  appendMessage: (conversationId: string, sender: ChatSender, content: string, senderAdminId?: string) =>
    prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: { conversationId, sender, content, senderAdminId },
        include: { senderAdmin: adminSelect },
      })

      await tx.chatConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: message.createdAt,
          unreadCount: sender === 'customer' ? { increment: 1 } : 0,
        },
      })
      return message
    }),
  markRead: (conversationId: string) =>
    prisma.chatConversation.update({ where: { id: conversationId }, data: { unreadCount: 0 } }),
  // For the Topbar bell: total unread across every conversation, plus the id
  // of the one conversation to jump straight to when it's the only one open.
  unreadSummary: async () => {
    const unread = await prisma.chatConversation.findMany({
      where: { unreadCount: { gt: 0 } },
      select: { id: true, unreadCount: true },
    })
    return {
      total: unread.reduce((sum, c) => sum + c.unreadCount, 0),
      soleConversationId: unread.length === 1 ? unread[0].id : null,
    }
  },
}
