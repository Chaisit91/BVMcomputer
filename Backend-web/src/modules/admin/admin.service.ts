import { prisma } from '../../lib/prisma'
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
    const current = await adminRepository.findById(id)

    const updated = password
      ? await adminRepository.update(id, { ...rest, passwordHash: await hashPassword(password) })
      : await adminRepository.update(id, rest)

    if (current && rest.role && rest.role !== current.role) {
      await prisma.adminRoleHistory.create({
        data: { adminId: id, date: new Date(), description: `เปลี่ยนบทบาทจาก ${current.role} เป็น ${rest.role}` },
      })
    }

    return updated
  },

  remove: (id: string) => adminRepository.remove(id),

  // Every token issued before "now" for this admin stops working on their
  // next request — see authMiddleware.ts. Their session cookie itself is
  // untouched (we can't reach into their browser), just rejected server-side.
  forceLogout: (id: string) => adminRepository.update(id, { sessionsInvalidatedAt: new Date() }),

  // Verifies credentials only — src/modules/auth owns token issuing and the
  // response shape admin-web expects.
  verifyCredentials: async (email: string, password: string) => {
    const admin = await adminRepository.findByEmail(email)
    if (!admin) return null

    const valid = await comparePassword(password, admin.passwordHash)
    return valid ? admin : null
  },
}
