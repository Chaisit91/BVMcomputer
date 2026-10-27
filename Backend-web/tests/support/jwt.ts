import 'dotenv/config'
import jwt from 'jsonwebtoken'

// Tests authenticate by minting a session JWT directly (same shape
// authMiddleware verifies) instead of driving the real login form — there's
// no UI in these API-level tests, and it keeps fixture accounts from ever
// needing a real, known password.
export function signSessionToken(adminId: string, role: string): string {
  return jwt.sign({ id: adminId, role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
}

export function sessionCookieHeader(adminId: string, role: string): string {
  return `bvm_session=${signSessionToken(adminId, role)}`
}
