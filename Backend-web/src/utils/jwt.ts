import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? ''

export interface JwtPayload {
  id: string
  role: string
}

export function signToken(payload: JwtPayload, expiresIn: `${number}${'m' | 'h' | 'd'}` = '1d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
