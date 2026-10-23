import { Router } from 'express'
import { z } from 'zod'
import { ValidationError } from '../../lib/errors'
import { chatService } from './chat.service'

export const chatPublicRouter = Router()

const incomingMessageSchema = z.object({ content: z.string().trim().min(1).max(2000) }).strict()

// No auth — the storefront (not built yet) will POST here directly once a
// customer sends a chat message, same reasoning as computer-upgrade-public.router.ts.
chatPublicRouter.post('/:customerId/messages', async (req, res) => {
  const result = incomingMessageSchema.safeParse(req.body)
  if (!result.success) throw new ValidationError(result.error.issues.map((issue) => issue.message).join(', '))
  const message = await chatService.receiveFromCustomer(req.params.customerId, result.data.content)
  res.status(201).json(message)
})
