import { comparePassword, hashPassword } from '../../utils/password'
import { adminRepository } from './admin.repository'

// ponytail: passes data straight through otherwise — swap in a Zod schema
// (mirroring admin-web/src/schemas/admin.schema.ts) before this handles real traffic.
export const adminService = {
  list: () => adminRepository.findMany(),
  getById: (id: string) => adminRepository.findById(id),

  create: async (data: any) => {
    const { password, ...rest } = data
    const passwordHash = await hashPassword(password)
    return adminRepository.create({ ...rest, passwordHash })
  },

  update: async (id: string, data: any) => {
    const { password, ...rest } = data
    if (!password) return adminRepository.update(id, rest)
    return adminRepository.update(id, { ...rest, passwordHash: await hashPassword(password) })
  },

  remove: (id: string) => adminRepository.remove(id),

  // Verifies credentials only — src/modules/auth owns token issuing and the
  // response shape admin-web expects.
  verifyCredentials: async (email: string, password: string) => {
    const admin = await adminRepository.findByEmail(email)
    if (!admin) return null

    const valid = await comparePassword(password, admin.passwordHash)
    return valid ? admin : null
  },
}
