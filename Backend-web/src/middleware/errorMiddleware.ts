import type { NextFunction, Request, Response } from 'express'
import { ValidationError } from '../lib/errors'

// Express 5 auto-forwards rejected promises from route handlers here,
// so no separate asyncHandler wrapper is needed on routes.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message })
    return
  }

  console.error(err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({ message })
}
