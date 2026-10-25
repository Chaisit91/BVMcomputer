import { Router } from 'express'
import multer from 'multer'
import type { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { ValidationError } from '../../lib/errors'
import { uploadImage } from '../../utils/uploadImage'
import { announcementService } from './announcement.service'

export const announcementRouter = Router()

const DEPARTMENTS = ['inventory_manager', 'sales_staff', 'content_moderator'] as const

// No mimetype filter — announcements explicitly allow images, PDFs, or
// anything else, unlike the avatar upload which is image-only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
})

announcementRouter.get('/', async (req: AuthenticatedRequest, res) => {
  res.json(await announcementService.list(req.user!.role as any))
})

announcementRouter.get('/unread-count', async (req: AuthenticatedRequest, res) => {
  const count = await announcementService.unreadCount(req.user!.id, req.user!.role as any)
  res.json({ count })
})

announcementRouter.post('/', upload.array('files', 5), async (req: AuthenticatedRequest, res) => {
  // Only super_admin or a department's team lead may broadcast.
  if (req.user!.role !== 'super_admin' && !req.user!.isTeamLead) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
  if (!content) throw new ValidationError('content is required')

  // Only super_admin may target a specific department; a team lead's target
  // is always their own role regardless of what's sent here (see service).
  let targetDepartment: (typeof DEPARTMENTS)[number] | null = null
  if (req.body?.department) {
    if (!DEPARTMENTS.includes(req.body.department)) throw new ValidationError('invalid department')
    targetDepartment = req.body.department
  }

  let linkUrl: string | null = null
  if (typeof req.body?.link === 'string' && req.body.link.trim()) {
    try {
      linkUrl = new URL(req.body.link.trim()).toString()
    } catch {
      throw new ValidationError('invalid link')
    }
  }

  const announcement = await announcementService.create(req.user!.id, req.user!.role as any, content, linkUrl, targetDepartment)

  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  if (files.length > 0) {
    const uploaded = await Promise.all(
      files.map(async (file, index) => {
        const ext = file.originalname.split('.').pop() ?? 'bin'
        const path = `announcement-attachments/${announcement.id}-${Date.now()}-${index}.${ext}`
        const url = await uploadImage(path, file.buffer, file.mimetype)
        return { url, fileName: file.originalname, contentType: file.mimetype, fileSizeBytes: file.size }
      }),
    )
    await announcementService.addAttachments(announcement.id, uploaded)
  }

  res.status(201).json(await announcementService.getById(announcement.id))
})

announcementRouter.put('/seen', async (req: AuthenticatedRequest, res) => {
  await announcementService.markSeen(req.user!.id)
  res.status(204).send()
})

announcementRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const announcement = await announcementService.getById(String(req.params.id))
  if (!announcement) {
    res.status(404).json({ message: 'Not found' })
    return
  }

  // Author deletes their own post; otherwise only super_admin, or the team
  // lead of the department it's scoped to, may remove someone else's.
  const isAuthor = announcement.authorId === req.user!.id
  const isSuperAdmin = req.user!.role === 'super_admin'
  const isOwnDepartmentLead = Boolean(req.user!.isTeamLead) && announcement.department === req.user!.role
  if (!isAuthor && !isSuperAdmin && !isOwnDepartmentLead) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  await announcementService.remove(announcement.id)
  res.status(204).send()
})
