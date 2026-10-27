import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jwt from 'jsonwebtoken'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// JWT_SECRET lives only in Backend-web/.env — admin-web has no backend
// secrets of its own. Reusing it here (rather than duplicating the value)
// is how these E2E tests mint a valid session without driving the login
// form for every single test.
dotenv.config({ path: path.resolve(dirname, '../../../Backend-web/.env') })

export function signSessionToken(adminId: string, role: string): string {
  return jwt.sign({ id: adminId, role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
}
