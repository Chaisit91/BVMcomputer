import { Router } from 'express'
import type { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { ValidationError } from '../../lib/errors'
import { chatService } from './chat.service'

export const chatRouter = Router()

chatRouter.get('/', async (_req, res) => {
  res.json(await chatService.listConversations())
})

chatRouter.get('/unread-count', async (_req, res) => {
  res.json(await chatService.unreadSummary())
})

chatRouter.get('/:conversationId', async (req, res) => {
  const conversation = await chatService.getConversation(String(req.params.conversationId))
  if (!conversation) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(conversation)
})

chatRouter.get('/:conversationId/messages', async (req, res) => {
  res.json(await chatService.getMessages(String(req.params.conversationId)))
})

chatRouter.post('/:conversationId/messages', async (req: AuthenticatedRequest, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
  if (!content) throw new ValidationError('content is required')
  const message = await chatService.reply(String(req.params.conversationId), req.user!.id, content)
  res.status(201).json(message)
})

chatRouter.put('/:conversationId/read', async (req, res) => {
  await chatService.markRead(String(req.params.conversationId))
  res.status(204).send()
})
