import { api } from '../lib/api'
import type { Announcement } from '../types/announcement'

function mapFromApi(raw: any): Announcement {
  return {
    id: raw.id,
    authorName: `${raw.author.firstName} ${raw.author.lastName}`,
    authorRole: raw.author.role,
    department: raw.department,
    content: raw.content,
    createdAt: raw.createdAt,
  }
}

export function getAnnouncements(): Promise<Announcement[]> {
  return api.get('/announcements').then((res) => res.data.map(mapFromApi))
}

export function getUnreadAnnouncementCount(): Promise<number> {
  return api.get('/announcements/unread-count').then((res) => res.data.count)
}

export function postAnnouncement(content: string): Promise<Announcement> {
  return api.post('/announcements', { content }).then((res) => mapFromApi(res.data))
}

export function markAnnouncementsSeen(): Promise<void> {
  return api.put('/announcements/seen').then(() => undefined)
}
