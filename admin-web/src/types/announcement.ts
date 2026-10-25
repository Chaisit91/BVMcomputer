import type { AdminRole } from './admin'

export interface Announcement {
  id: string
  authorName: string
  authorRole: AdminRole
  // null = broadcast to every department (posted by super_admin)
  department: AdminRole | null
  content: string
  createdAt: string
}
