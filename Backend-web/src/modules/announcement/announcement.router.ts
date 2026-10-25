import { Router } from 'express'
import type { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { ValidationError } from '../../lib/errors'
import { announcementService } from './announcement.service'

export const announcementRouter = Router()

announcementRouter.get('/', async (req: AuthenticatedRequest, res) => {
  res.json(await announcementService.list(req.user!.role as any))
})

announcementRouter.get('/unread-count', async (req: AuthenticatedRequest, res) => {
  const count = await announcementService.unreadCount(req.user!.id, req.user!.role as any)
  res.json({ count })
})

announcementRouter.post('/', async (req: AuthenticatedRequest, res) => {
  // Only super_admin or a department's team lead may broadcast.
  if (req.user!.role !== 'super_admin' && !req.user!.isTeamLead) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
  if (!content) throw new ValidationError('content is required')
  const announcement = await announcementService.create(req.user!.id, req.user!.role as any, content)
  res.status(201).json(announcement)
})

announcementRouter.put('/seen', async (req: AuthenticatedRequest, res) => {
  await announcementService.markSeen(req.user!.id)
  res.status(204).send()
})
