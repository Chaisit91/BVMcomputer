import { api } from '../lib/api'
import type { AdminCreateFormValues, AdminEditFormValues } from '../schemas/admin.schema'
import type { AdminAccount, AdminStatus, AdminSummary } from '../types/admin'

export function getAdmins(): Promise<AdminAccount[]> {
  return api.get<AdminAccount[]>('/admins').then((res) => res.data)
}

// No dedicated summary endpoint — the list is small, so derive it client-side
// instead of adding a backend route for a value that's trivial to compute.
export async function getAdminSummary(): Promise<AdminSummary> {
  const admins = await getAdmins()
  return {
    totalCount: admins.length,
    activeCount: admins.filter((admin) => admin.status === 'active').length,
    inactiveCount: admins.filter((admin) => admin.status === 'inactive').length,
  }
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
