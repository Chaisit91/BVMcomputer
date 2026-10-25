import { api } from '../lib/api'
import type { Announcement, AnnouncementAttachment } from '../types/announcement'
import type { AdminRole } from '../types/admin'

function mapAttachmentFromApi(raw: any): AnnouncementAttachment {
  return { id: raw.id, url: raw.url, fileName: raw.fileName, contentType: raw.contentType, fileSizeBytes: raw.fileSizeBytes }
}

function mapFromApi(raw: any): Announcement {
  return {
    id: raw.id,
    authorId: raw.authorId,
    authorName: `${raw.author.firstName} ${raw.author.lastName}`,
    authorRole: raw.author.role,
    department: raw.department,
    content: raw.content,
    linkUrl: raw.linkUrl,
    attachments: (raw.attachments ?? []).map(mapAttachmentFromApi),
    createdAt: raw.createdAt,
  }
}

export function getAnnouncements(): Promise<Announcement[]> {
  return api.get('/announcements').then((res) => res.data.map(mapFromApi))
}

export function getUnreadAnnouncementCount(): Promise<number> {
  return api.get('/announcements/unread-count').then((res) => res.data.count)
}

export function postAnnouncement(
  content: string,
  department: AdminRole | null = null,
  link: string | null = null,
  files: File[] = [],
): Promise<Announcement> {
  const form = new FormData()
  form.append('content', content)
  if (department) form.append('department', department)
  if (link) form.append('link', link)
  files.forEach((file) => form.append('files', file))

  return api.post('/announcements', form).then((res) => mapFromApi(res.data))
}

export function markAnnouncementsSeen(): Promise<void> {
  return api.put('/announcements/seen').then(() => undefined)
}

export function deleteAnnouncement(id: string): Promise<void> {
  return api.delete(`/announcements/${id}`).then(() => undefined)
}
