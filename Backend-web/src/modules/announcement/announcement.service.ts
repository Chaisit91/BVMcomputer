import type { AdminRole } from '../../../generated/prisma'
import { announcementRepository } from './announcement.repository'

export const announcementService = {
  list: (role: AdminRole) => announcementRepository.findVisibleFor(role),
  // super_admin can target one specific department or leave it null for
  // everyone; a team lead's post is always scoped to their own department —
  // targetDepartment is only ever honored for super_admin.
  create: (authorId: string, role: AdminRole, content: string, linkUrl: string | null, targetDepartment?: AdminRole | null) =>
    announcementRepository.create(authorId, role === 'super_admin' ? (targetDepartment ?? null) : role, content, linkUrl),
  addAttachments: (
    announcementId: string,
    attachments: { url: string; fileName: string; contentType: string; fileSizeBytes: number }[],
  ) => announcementRepository.addAttachments(announcementId, attachments),
  unreadCount: async (adminId: string, role: AdminRole) => {
    const since = await announcementRepository.getLastSeenAt(adminId)
    return announcementRepository.countVisibleSince(role, since)
  },
  markSeen: (adminId: string) => announcementRepository.markSeen(adminId),
  getById: (id: string) => announcementRepository.findById(id),
  remove: (id: string) => announcementRepository.remove(id),
}
