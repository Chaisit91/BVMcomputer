import { prisma } from '../../lib/prisma'
import { comparePassword, hashPassword } from '../../utils/password'
import { adminRepository } from './admin.repository'

// ponytail: passes data straight through otherwise — swap in a Zod schema
// (mirroring admin-web/src/schemas/admin.schema.ts) before this handles real traffic.
export const adminService = {
  list: () => adminRepository.findMany(),
  listByRole: (role: string) => adminRepository.findMany(role),
  getById: (id: string) => adminRepository.findById(id),

  // Every method below returns the same fully-shaped object findById does
  // (createdBy resolved to a name, roleHistory/loginHistory included) — the
  // raw Prisma create/update result is missing all three, and admin-web's
  // edit page reads roleHistory.length/loginHistory.length unconditionally,
  // so handing back the raw row crashes the page on the very next render.
  create: async (data: any) => {
    const { password, ...rest } = data
    const passwordHash = await hashPassword(password)
    const created = await adminRepository.create({ ...rest, passwordHash })
    return adminRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { password, ...rest } = data
    const current = await adminRepository.findById(id)

    if (password) {
      await adminRepository.update(id, { ...rest, passwordHash: await hashPassword(password) })
    } else {
      await adminRepository.update(id, rest)
    }

    if (current && rest.role && rest.role !== current.role) {
      await prisma.adminRoleHistory.create({
        data: { adminId: id, date: new Date(), description: `เปลี่ยนบทบาทจาก ${current.role} เป็น ${rest.role}` },
      })
    }

    return adminRepository.findById(id)
  },

  remove: (id: string) => adminRepository.remove(id),

  // Every token issued before "now" for this admin stops working on their
  // next request — see authMiddleware.ts. Their session cookie itself is
  // untouched (we can't reach into their browser), just rejected server-side.
  forceLogout: async (id: string) => {
    await adminRepository.update(id, { sessionsInvalidatedAt: new Date() })
    return adminRepository.findById(id)
  },

  // Verifies credentials only — src/modules/auth owns token issuing and the
  // response shape admin-web expects.
  verifyCredentials: async (email: string, password: string) => {
    const admin = await adminRepository.findByEmail(email)
    if (!admin) return null

    const valid = await comparePassword(password, admin.passwordHash)
    return valid ? admin : null
  },
}
