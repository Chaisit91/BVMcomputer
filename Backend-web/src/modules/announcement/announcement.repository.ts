import { prisma } from '../../lib/prisma'
import type { AdminRole } from '../../../generated/prisma'

const authorSelect = { select: { id: true, firstName: true, lastName: true, role: true } }
const withRelations = { author: authorSelect, attachments: true } as const

export const announcementRepository = {
  // super_admin sees every announcement; everyone else sees global ones
  // (department: null) plus whatever's scoped to their own department.
  findVisibleFor: (role: AdminRole) =>
    prisma.announcement.findMany({
      where: role === 'super_admin' ? {} : { OR: [{ department: null }, { department: role }] },
      include: withRelations,
      orderBy: { createdAt: 'desc' },
    }),
  create: (authorId: string, department: AdminRole | null, content: string, linkUrl: string | null) =>
    prisma.announcement.create({
      data: { authorId, department, content, linkUrl },
      include: withRelations,
    }),
  addAttachments: (
    announcementId: string,
    attachments: { url: string; fileName: string; contentType: string; fileSizeBytes: number }[],
  ) =>
    prisma.announcementAttachment.createMany({
      data: attachments.map((attachment) => ({ ...attachment, announcementId })),
    }),
  findById: (id: string) => prisma.announcement.findUnique({ where: { id }, include: withRelations }),
  remove: (id: string) => prisma.announcement.delete({ where: { id } }),
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
