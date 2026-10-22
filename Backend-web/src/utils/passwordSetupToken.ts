import crypto from 'crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Raw token goes in the email link; only its hash is ever persisted (same
// reasoning as a password hash — a DB leak alone shouldn't let anyone claim
// a pending setup link).
export function createPasswordSetupToken() {
  const rawToken = crypto.randomBytes(32).toString('hex')
  return {
    rawToken,
    tokenHash: hashPasswordSetupToken(rawToken),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  }
}

export function hashPasswordSetupToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}
