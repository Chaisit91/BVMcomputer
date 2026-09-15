import bcrypt from 'bcryptjs'

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}
