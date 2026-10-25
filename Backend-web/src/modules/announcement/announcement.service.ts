import type { AdminRole } from '../../../generated/prisma'
import { announcementRepository } from './announcement.repository'

export const announcementService = {
  list: (role: AdminRole) => announcementRepository.findVisibleFor(role),
  // super_admin broadcasts to every department (department: null); a team
  // lead's post is scoped to their own department only.
  create: (authorId: string, role: AdminRole, content: string) =>
    announcementRepository.create(authorId, role === 'super_admin' ? null : role, content),
  unreadCount: async (adminId: string, role: AdminRole) => {
    const since = await announcementRepository.getLastSeenAt(adminId)
    return announcementRepository.countVisibleSince(role, since)
  },
  markSeen: (adminId: string) => announcementRepository.markSeen(adminId),
}
