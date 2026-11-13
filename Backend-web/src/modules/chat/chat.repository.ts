import { prisma } from '../../lib/prisma'
import { ChatConversation, ChatMessage } from './chat.model'
import type { ChatSender } from '../../../generated/prisma'

const adminSelect = { select: { id: true, firstName: true, lastName: true } }
const customerSelect = { select: { id: true, fullName: true, customerCode: true } }
const attachmentsInclude = { orderBy: { createdAt: 'asc' as const } }

export interface IncomingAttachment {
  url: string
  fileName: string
  contentType: string
  fileSizeBytes: number
}

export const chatRepository = {
  findConversations: () =>
    ChatConversation.findMany({
      include: {
        customer: customerSelect,
        // Only the attachment count, not the files themselves — the list
        // view just needs to know whether to show "📎 ไฟล์แนบ" as the preview.
        messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { _count: { select: { attachments: true } } } },
      },
      orderBy: { lastMessageAt: 'desc' },
    }),
  findByCustomerId: (customerId: string) => ChatConversation.findUnique({ where: { customerId } }),
  findById: (id: string) =>
    ChatConversation.findUnique({
      where: { id },
      include: { customer: customerSelect },
    }),
  // senderAdmin is included so the back office can always tell which admin
  // actually sent a given reply, even though a customer-facing surface would
  // show the company's name instead.
  findMessages: (conversationId: string) =>
    ChatMessage.findMany({
      where: { conversationId },
      include: { senderAdmin: adminSelect, attachments: attachmentsInclude },
      orderBy: { createdAt: 'asc' },
    }),
  createConversation: (customerId: string) => ChatConversation.create({ data: { customerId } }),
  // Customer messages bump unreadCount; an admin reply always resets it back
  // to 0 (the thread is caught up as of the admin's own reply). Any admin can
  // reply to any conversation — there's no ownership/claim to check.
  appendMessage: (
    conversationId: string,
    sender: ChatSender,
    content: string,
    senderAdminId?: string,
    attachments: IncomingAttachment[] = [],
  ) =>
    // Transactional client (tx) is its own scoped delegate, separate from the
    // module-level ChatConversation/ChatMessage accessors above.
    prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          conversationId,
          sender,
          content,
          senderAdminId,
          attachments: { create: attachments },
        },
        include: { senderAdmin: adminSelect, attachments: attachmentsInclude },
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
    ChatConversation.update({ where: { id: conversationId }, data: { unreadCount: 0 } }),
  // A personal "what you did today" count for the dashboard — not an
  // assignment/ownership check, just how many replies this admin happened to
  // send (any admin can reply to any conversation, see appendMessage above).
  countRepliesToday: (adminId: string) => {
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    return ChatMessage.count({ where: { senderAdminId: adminId, sender: 'admin', createdAt: { gte: startOfToday } } })
  },
  // For the Topbar bell: total unread across every conversation, plus the id
  // of the one conversation to jump straight to when it's the only one open.
  unreadSummary: async () => {
    const unread = await ChatConversation.findMany({
      where: { unreadCount: { gt: 0 } },
      select: { id: true, unreadCount: true },
    })
    return {
      total: unread.reduce((sum, c) => sum + c.unreadCount, 0),
      soleConversationId: unread.length === 1 ? unread[0].id : null,
    }
  },
}
