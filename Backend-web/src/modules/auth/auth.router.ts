import type { Response } from 'express'
import { Router } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, SESSION_COOKIE, type AuthenticatedRequest } from '../../middleware/authMiddleware'
import { signToken } from '../../utils/jwt'
import { adminRepository } from '../admin/admin.repository'
import { adminService } from '../admin/admin.service'

export const authRouter = Router()

const DAY_MS = 24 * 60 * 60 * 1000

function setSessionCookie(res: Response, token: string, remember: boolean) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // omit maxAge when not "remembered" so it's a session cookie, cleared on browser close
    ...(remember ? { maxAge: 30 * DAY_MS } : {}),
  })
}

function toAuthUser(admin: { id: string; firstName: string; lastName: string; email: string; role: string }) {
  return { id: admin.id, name: `${admin.firstName} ${admin.lastName}`, email: admin.email, role: admin.role }
}

authRouter.post('/login', async (req, res) => {
  const { identifier, password, remember } = req.body
  const admin = await adminService.verifyCredentials(identifier, password)
  if (!admin) {
    res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    return
  }

  await prisma.adminAccount.update({
    where: { id: admin.id },
    data: {
      lastActiveAt: new Date(),
      loginHistory: { create: { date: new Date(), device: req.headers['user-agent'] ?? 'unknown' } },
    },
  })

  const token = signToken({ id: admin.id, role: admin.role }, remember ? '30d' : '1d')
  setSessionCookie(res, token, Boolean(remember))
  res.json({ user: toAuthUser(admin) })
})

authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const admin = await adminRepository.findById(req.user!.id)
  if (!admin) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  res.json({ user: toAuthUser(admin) })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE)
  res.status(204).send()
})

// ponytail: single-token "refresh" (just re-issues on a still-valid cookie),
// not a separate access/refresh-token pair — matches what admin-web's
// interceptor actually calls on 401. Upgrade to real refresh tokens if
// session hijacking/rotation becomes a concern.
authRouter.post('/refresh', authMiddleware, (req: AuthenticatedRequest, res) => {
  const token = signToken({ id: req.user!.id, role: req.user!.role })
  setSessionCookie(res, token, false)
  res.status(204).send()
})
