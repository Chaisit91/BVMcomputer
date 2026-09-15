import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './authMiddleware'

// super_admin always passes, matching the RBAC rule agreed for admin-web:
// only super_admin sees/does everything, everyone else is scoped to their roles.
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    if (req.user.role !== 'super_admin' && !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    next()
  }
}

// Lets an admin operate on their own account (self-service profile edit) even
// when their role wouldn't otherwise pass requireRole — used for :id routes
// where "it's me" should be allowed alongside "I'm one of these roles".
export function requireSelfOrRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    if (req.user.id === req.params.id || req.user.role === 'super_admin' || roles.includes(req.user.role)) {
      next()
      return
    }
    res.status(403).json({ message: 'Forbidden' })
  }
}
