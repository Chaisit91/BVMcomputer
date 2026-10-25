import type { AdminRole } from './admin'

export interface AnnouncementAttachment {
  id: string
  url: string
  fileName: string
  contentType: string
  fileSizeBytes: number
}

export interface Announcement {
  id: string
  authorId: string
  authorName: string
  authorRole: AdminRole
  // null = broadcast to every department (posted by super_admin)
  department: AdminRole | null
  content: string
  linkUrl: string | null
  attachments: AnnouncementAttachment[]
  createdAt: string
}
