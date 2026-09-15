import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? ''

export interface JwtPayload {
  id: string
  role: string
}

// jsonwebtoken adds `iat` (issued-at, seconds since epoch) to every signed
// token automatically — widen the return type so callers can read it back
// (needed to compare against AdminAccount.sessionsInvalidatedAt).
export interface VerifiedJwtPayload extends JwtPayload {
  iat: number
}

export function signToken(payload: JwtPayload, expiresIn: `${number}${'m' | 'h' | 'd'}` = '1d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): VerifiedJwtPayload {
  return jwt.verify(token, JWT_SECRET) as VerifiedJwtPayload
}
