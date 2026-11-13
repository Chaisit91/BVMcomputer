import { Router } from 'express'
import type { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { ValidationError } from '../../lib/errors'
import { chatAttachmentUpload, uploadChatAttachments } from './chat-attachment-upload'
import { chatService } from './chat.service'

export const chatRouter = Router()

chatRouter.get('/', async (_req, res) => {
  res.json(await chatService.listConversations())
})

chatRouter.get('/unread-count', async (_req, res) => {
  res.json(await chatService.unreadSummary())
})

chatRouter.get('/my-replies-today', async (req: AuthenticatedRequest, res) => {
  res.json({ count: await chatService.countMyRepliesToday(req.user!.id) })
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

chatRouter.post(
  '/:conversationId/messages',
  chatAttachmentUpload.array('files', 5),
  async (req: AuthenticatedRequest, res) => {
    const conversationId = String(req.params.conversationId)
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (!content && files.length === 0) throw new ValidationError('content or at least one file is required')

    const attachments = files.length > 0 ? await uploadChatAttachments(conversationId, files) : []
    const message = await chatService.reply(conversationId, req.user!.id, content, attachments)
    res.status(201).json(message)
  },
)

chatRouter.put('/:conversationId/read', async (req, res) => {
  await chatService.markRead(String(req.params.conversationId))
  res.status(204).send()
})
