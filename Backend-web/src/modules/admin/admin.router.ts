import { Router } from 'express'
import multer from 'multer'
import { authMiddleware, type AuthenticatedRequest } from '../../middleware/authMiddleware'
import { requireRole } from '../../middleware/roleMiddleware'
import { uploadImage } from '../../utils/uploadImage'
import { adminRepository } from './admin.repository'
import { adminService } from './admin.service'

export const adminRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  },
})

export function withoutPasswordHash<T extends { passwordHash: string }>(admin: T) {
  const { passwordHash, ...rest } = admin
  return rest
}

// Creating/deleting accounts and cross-department moves are super_admin only.
// Viewing/editing one account is wider: yourself always, or — for a team
// lead — anyone who shares your own role (your department). Regular staff
// can only ever reach their own id; requireCanManage below enforces that per
// route since it needs the target's current role, which requireRole alone
// can't see.
adminRouter.use(authMiddleware)

async function canManage(req: AuthenticatedRequest, targetId: string): Promise<boolean> {
  if (req.user!.role === 'super_admin' || req.user!.id === targetId) return true
  if (!req.user!.isTeamLead) return false
  const target = await adminRepository.findById(targetId)
  return !!target && target.role === req.user!.role
}

async function requireCanManage(req: AuthenticatedRequest, res: import('express').Response, next: import('express').NextFunction) {
  if (await canManage(req, String(req.params.id))) {
    next()
    return
  }
  res.status(403).json({ message: 'Forbidden' })
}

// A team lead can edit any regular (non-lead) teammate in their own
// department, but never a fellow team lead — peers can't act on peers, not
// even for name/phone/avatar. Only super_admin or the account owner can.
async function isPeerTeamLead(req: AuthenticatedRequest, targetId: string): Promise<boolean> {
  if (req.user!.role === 'super_admin' || !req.user!.isTeamLead || req.user!.id === targetId) return false
  const target = await adminRepository.findById(targetId)
  return !!target && target.isTeamLead
}

// Any authenticated admin can see their own department's roster — used for
// the Topbar's "my team" link that replaces "ผู้ดูแลระบบ" for non-super_admin roles.
adminRouter.get('/team', async (req: AuthenticatedRequest, res) => {
  res.json((await adminService.listByRole(req.user!.role)).map(withoutPasswordHash))
})

adminRouter.get('/', requireRole('super_admin'), async (req, res) => {
  res.json((await adminService.list()).map(withoutPasswordHash))
})

adminRouter.get('/:id', requireCanManage, async (req, res) => {
  const item = await adminService.getById(String(req.params.id))
  if (!item) {
    res.status(404).json({ message: 'Not found' })
    return
  }
  res.json(withoutPasswordHash(item))
})

adminRouter.post('/', requireRole('super_admin'), async (req: AuthenticatedRequest, res) => {
  const created = await adminService.create({ ...req.body, createdById: req.user!.id })
  res.status(201).json(withoutPasswordHash(created))
})

adminRouter.put('/:id', requireCanManage, async (req: AuthenticatedRequest, res) => {
  const isSelf = req.user!.id === String(req.params.id)
  if (req.user!.role !== 'super_admin' && !isSelf && (await isPeerTeamLead(req, String(req.params.id)))) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const body = { ...req.body }
  // Only super_admin can move someone across departments or grant super_admin.
  // A team lead editing a (non-lead) teammate, or anyone editing themselves,
  // can still touch status/isTeamLead; plain self-edit by a non-lead strips
  // those too, so regular staff can only ever change their own profile
  // fields, never their own standing.
  if (req.user!.role !== 'super_admin') {
    delete body.role
    delete body.createdById
    if (!req.user!.isTeamLead) {
      delete body.status
      delete body.isTeamLead
    }
    // Identity/credential fields: a team lead managing a teammate must not be
    // able to take over their account by changing their email or password —
    // only the account owner (editing themselves) or super_admin may touch these.
    if (!isSelf) {
      delete body.email
      delete body.password
    }
  }
  res.json(withoutPasswordHash(await adminService.update(String(req.params.id), body)))
})

adminRouter.delete('/:id', requireRole('super_admin'), async (req, res) => {
  await adminService.remove(String(req.params.id))
  res.status(204).send()
})

adminRouter.post('/:id/force-logout', requireRole('super_admin'), async (req, res) => {
  res.json(withoutPasswordHash(await adminService.forceLogout(String(req.params.id))))
})

adminRouter.post('/:id/avatar', requireCanManage, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
  const isSelf = req.user!.id === String(req.params.id)
  if (req.user!.role !== 'super_admin' && !isSelf && (await isPeerTeamLead(req, String(req.params.id)))) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  if (!req.file) {
    res.status(400).json({ message: 'ต้องแนบไฟล์รูปภาพ (avatar)' })
    return
  }

  const ext = req.file.originalname.split('.').pop() ?? 'jpg'
  const path = `admin-avatars/${req.params.id}-${Date.now()}.${ext}`
  const avatarUrl = await uploadImage(path, req.file.buffer, req.file.mimetype)

  const updated = await adminService.update(String(req.params.id), { avatarUrl })
  res.json(withoutPasswordHash(updated))
})
