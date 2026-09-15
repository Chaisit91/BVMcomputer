import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken, type JwtPayload } from '../utils/jwt'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { isTeamLead?: boolean }
}

export const SESSION_COOKIE = 'bvm_session'

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const payload = verifyToken(token)

    // A force-logout sets sessionsInvalidatedAt — any token issued before that
    // moment is rejected even though its signature is still valid.
    const admin = await prisma.adminAccount.findUnique({
      where: { id: payload.id },
      select: { sessionsInvalidatedAt: true, isTeamLead: true, lastActiveAt: true },
    })
    if (admin?.sessionsInvalidatedAt && payload.iat * 1000 < admin.sessionsInvalidatedAt.getTime()) {
      res.status(401).json({ message: 'Session revoked' })
      return
    }

    // Cheap "online" signal: refresh lastActiveAt on real traffic, not just
    // login, so admin-web can derive online/offline from it. Throttled to
    // once/minute per admin so this doesn't turn into a write on every request.
    if (!admin?.lastActiveAt || Date.now() - admin.lastActiveAt.getTime() > 60_000) {
      prisma.adminAccount.update({ where: { id: payload.id }, data: { lastActiveAt: new Date() } }).catch(() => {})
    }

    req.user = { ...payload, isTeamLead: admin?.isTeamLead ?? false }
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
