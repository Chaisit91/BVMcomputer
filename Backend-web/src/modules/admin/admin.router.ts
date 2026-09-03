import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../../middleware/authMiddleware'
import { requireRole } from '../../middleware/roleMiddleware'
import { adminService } from './admin.service'

export const adminRouter = Router()

export function withoutPasswordHash<T extends { passwordHash: string }>(admin: T) {
  const { passwordHash, ...rest } = admin
  return rest
}

// Admin-account management is super_admin only — matches admin-web's own nav
// rule (showAdminsNav = role === 'super_admin') and, more importantly, closes
// the hole where anyone could POST here and mint themselves a super_admin.
adminRouter.use(authMiddleware, requireRole('super_admin'))

adminRouter.get('/', async (req, res) => {
  res.json((await adminService.list()).map(withoutPasswordHash))
})

adminRouter.get('/:id', async (req, res) => {
  const item = await adminService.getById(req.params.id)
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(withoutPasswordHash(item))
})

adminRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const created = await adminService.create({ ...req.body, createdById: req.user!.id })
  res.status(201).json(withoutPasswordHash(created))
})

adminRouter.put('/:id', async (req, res) => {
  res.json(withoutPasswordHash(await adminService.update(req.params.id, req.body)))
})

adminRouter.delete('/:id', async (req, res) => {
  await adminService.remove(req.params.id)
  res.status(204).send()
})

adminRouter.post('/:id/force-logout', async (req, res) => {
  res.json(withoutPasswordHash(await adminService.forceLogout(req.params.id)))
})
