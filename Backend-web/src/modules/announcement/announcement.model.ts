import { prisma } from '../../lib/prisma'
import type {
  Announcement as AnnouncementRecord,
  AnnouncementAttachment as AnnouncementAttachmentRecord,
} from '../../../generated/prisma'

export const Announcement = prisma.announcement
export const AnnouncementAttachment = prisma.announcementAttachment
export type { AnnouncementRecord, AnnouncementAttachmentRecord }
