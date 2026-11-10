import { Announcement, AnnouncementAttachment } from './announcement.model'
import { AdminAccount } from '../admin/admin.model'
import type { AdminRole } from '../../../generated/prisma'

const authorSelect = { select: { id: true, firstName: true, lastName: true, role: true } }
const withRelations = { author: authorSelect, attachments: true } as const

export const announcementRepository = {
  // super_admin sees every announcement; everyone else sees global ones
  // (department: null) plus whatever's scoped to their own department.
  findVisibleFor: (role: AdminRole) =>
    Announcement.findMany({
      where: role === 'super_admin' ? {} : { OR: [{ department: null }, { department: role }] },
      include: withRelations,
      orderBy: { createdAt: 'desc' },
    }),
  create: (authorId: string, department: AdminRole | null, content: string, linkUrl: string | null) =>
    Announcement.create({
      data: { authorId, department, content, linkUrl },
      include: withRelations,
    }),
  addAttachments: (
    announcementId: string,
    attachments: { url: string; fileName: string; contentType: string; fileSizeBytes: number }[],
  ) =>
    AnnouncementAttachment.createMany({
      data: attachments.map((attachment) => ({ ...attachment, announcementId })),
    }),
  findById: (id: string) => Announcement.findUnique({ where: { id }, include: withRelations }),
  remove: (id: string) => Announcement.delete({ where: { id } }),
  countVisibleSince: (role: AdminRole, since: Date | null) =>
    Announcement.count({
      where: {
        ...(role === 'super_admin' ? {} : { OR: [{ department: null }, { department: role }] }),
        ...(since ? { createdAt: { gt: since } } : {}),
      },
    }),
  markSeen: (adminId: string) =>
    AdminAccount.update({ where: { id: adminId }, data: { lastSeenAnnouncementAt: new Date() } }),
  getLastSeenAt: async (adminId: string) => {
    const admin = await AdminAccount.findUnique({ where: { id: adminId }, select: { lastSeenAnnouncementAt: true } })
    return admin?.lastSeenAnnouncementAt ?? null
  },
}
