import { prisma } from '../../lib/prisma'
import type { ChatConversation as ChatConversationRecord, ChatMessage as ChatMessageRecord } from '../../../generated/prisma'

export const ChatConversation = prisma.chatConversation
export const ChatMessage = prisma.chatMessage
export type { ChatConversationRecord, ChatMessageRecord }
