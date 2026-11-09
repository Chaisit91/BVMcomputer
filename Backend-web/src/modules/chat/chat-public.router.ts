import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { z } from 'zod'
import { ValidationError } from '../../lib/errors'
import { customerRepository } from '../customer/customer.repository'
import { chatAttachmentUpload, uploadChatAttachments } from './chat-attachment-upload'
import { chatService } from './chat.service'

export const chatPublicRouter = Router()

// max(2000) still applies; min(0) since an attachment-only message is valid
// (content may be sent as "" or omitted entirely by the client).
const incomingMessageSchema = z.object({ content: z.string().trim().max(2000).optional() })

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 20
// ponytail: in-memory Map, resets on restart and only works within a single
// Backend-web process — fine for one instance; move to a shared store
// (Redis) if this ever runs behind multiple instances/a load balancer.
const recentRequestsByCustomer = new Map<string, number[]>()

// Runs before multer even starts buffering a file, so a customerId already
// over its limit never costs us the upload work, not just the DB write.
function rateLimitByCustomerId(req: Request, res: Response, next: NextFunction) {
  const customerId = String(req.params.customerId)
  const now = Date.now()
  const recent = (recentRequestsByCustomer.get(customerId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  recentRequestsByCustomer.set(customerId, recent)
  if (recent.length > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ message: 'ส่งข้อความถี่เกินไป กรุณาลองใหม่อีกครั้งในอีกสักครู่' })
    return
  }
  next()
}

// No auth — the storefront (not built yet) will POST here directly once a
// customer sends a chat message, same reasoning as computer-upgrade-public.router.ts.
// Attachment types are locked down (see chat-attachment-upload.ts) precisely
// because this endpoint has no auth at all — anyone who knows a customerId
// can call it; the customer-existence check below runs before any file is
// uploaded, so a made-up id can't be used to write into Supabase Storage.
chatPublicRouter.post(
  '/:customerId/messages',
  rateLimitByCustomerId,
  chatAttachmentUpload.array('files', 5),
  async (req, res) => {
    const customerId = String(req.params.customerId)
    if (!(await customerRepository.exists(customerId))) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    const result = incomingMessageSchema.safeParse(req.body)
    if (!result.success) throw new ValidationError(result.error.issues.map((issue) => issue.message).join(', '))
    const content = result.data.content?.trim() ?? ''
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (!content && files.length === 0) throw new ValidationError('content or at least one file is required')

    const attachments = files.length > 0 ? await uploadChatAttachments(customerId, files) : []
    const message = await chatService.receiveFromCustomer(customerId, content, attachments)
    res.status(201).json(message)
  },
)
