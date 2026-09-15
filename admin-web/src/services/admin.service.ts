import { api } from '../lib/api'
import type { AdminCreateFormValues, AdminEditFormValues } from '../schemas/admin.schema'
import type { AdminAccount, AdminStatus } from '../types/admin'

export function getAdmins(): Promise<AdminAccount[]> {
  return api.get<AdminAccount[]>('/admins').then((res) => res.data)
}

// Own-department roster — what non-super_admin roles see instead of the full
// admin list (backend scopes it server-side to the caller's own role).
export function getTeam(): Promise<AdminAccount[]> {
  return api.get<AdminAccount[]>('/admins/team').then((res) => res.data)
}

export function getAdminDetail(id: string): Promise<AdminAccount | null> {
  return api
    .get<AdminAccount>(`/admins/${id}`)
    .then((res) => res.data)
    .catch(() => null)
}

export function saveAdmin(id: string, data: AdminEditFormValues): Promise<void> {
  const { active, confirmPassword, password, ...rest } = data
  return api
    .put(`/admins/${id}`, { ...rest, status: active ? 'active' : 'inactive', ...(password ? { password } : {}) })
    .then(() => undefined)
}

export function createAdmin(data: AdminCreateFormValues): Promise<{ id: string }> {
  const { active, confirmPassword, ...rest } = data
  return api
    .post<AdminAccount>('/admins', { ...rest, status: active ? 'active' : 'inactive' })
    .then((res) => ({ id: res.data.id }))
}

export function updateAdminStatus(id: string, status: AdminStatus): Promise<void> {
  return api.put(`/admins/${id}`, { status }).then(() => undefined)
}

export function forceLogoutAdmin(id: string): Promise<void> {
  return api.post(`/admins/${id}/force-logout`).then(() => undefined)
}

export function uploadAdminAvatar(id: string, file: File): Promise<AdminAccount> {
  const formData = new FormData()
  formData.append('avatar', file)
  return api.post<AdminAccount>(`/admins/${id}/avatar`, formData).then((res) => res.data)
}
