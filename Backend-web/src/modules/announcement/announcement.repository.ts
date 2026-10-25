import { prisma } from '../../lib/prisma'
import type { AdminRole } from '../../../generated/prisma'

const authorSelect = { select: { id: true, firstName: true, lastName: true, role: true } }

export const announcementRepository = {
  // super_admin sees every announcement; everyone else sees global ones
  // (department: null) plus whatever's scoped to their own department.
  findVisibleFor: (role: AdminRole) =>
    prisma.announcement.findMany({
      where: role === 'super_admin' ? {} : { OR: [{ department: null }, { department: role }] },
      include: { author: authorSelect },
      orderBy: { createdAt: 'desc' },
    }),
  create: (authorId: string, department: AdminRole | null, content: string) =>
    prisma.announcement.create({
      data: { authorId, department, content },
      include: { author: authorSelect },
    }),
  countVisibleSince: (role: AdminRole, since: Date | null) =>
    prisma.announcement.count({
      where: {
        ...(role === 'super_admin' ? {} : { OR: [{ department: null }, { department: role }] }),
        ...(since ? { createdAt: { gt: since } } : {}),
      },
    }),
  markSeen: (adminId: string) =>
    prisma.adminAccount.update({ where: { id: adminId }, data: { lastSeenAnnouncementAt: new Date() } }),
  getLastSeenAt: async (adminId: string) => {
    const admin = await prisma.adminAccount.findUnique({ where: { id: adminId }, select: { lastSeenAnnouncementAt: true } })
    return admin?.lastSeenAnnouncementAt ?? null
  },
}
