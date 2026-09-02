import type { NextFunction, Request, Response } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export const SESSION_COOKIE = 'bvm_session'

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
