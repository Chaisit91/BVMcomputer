export type AdminRole = 'super_admin' | 'inventory_manager' | 'sales_staff' | 'content_moderator'
export type AdminStatus = 'active' | 'inactive'

export interface AdminRoleHistoryEntry {
  date: string
  description: string
}

export interface AdminLoginHistoryEntry {
  date: string
  device: string
}

export interface AdminAccount {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  role: AdminRole
  status: AdminStatus
  lastActiveAt: string
  createdAt: string
  createdBy: string
  roleHistory: AdminRoleHistoryEntry[]
  loginHistory: AdminLoginHistoryEntry[]
  notes: string
}

export interface AdminSummary {
  totalCount: number
  activeCount: number
  inactiveCount: number
}

export const adminRoleMeta: Record<AdminRole, { label: string; badgeClass: string }> = {
  super_admin: { label: 'Super Admin', badgeClass: 'bg-rose-50 text-rose-600' },
  inventory_manager: { label: 'ผู้จัดการคลัง', badgeClass: 'bg-blue-50 text-blue-600' },
  sales_staff: { label: 'พนักงานขาย', badgeClass: 'bg-emerald-50 text-emerald-600' },
  content_moderator: { label: 'ผู้ดูแลเนื้อหา', badgeClass: 'bg-amber-50 text-amber-600' },
}
