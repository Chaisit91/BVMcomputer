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

// Public endpoint (no auth) — a brand-new admin has no session yet when they
// click the emailed "set your password" link.
export function setPasswordWithToken(token: string, newPassword: string): Promise<void> {
  return api.post('/public/admin-password-setup', { token, newPassword }).then(() => undefined)
}

// Public endpoint (no auth) — "forgot password" self-service. Always
// resolves with the backend's generic message, whether or not the email
// matched an account (see admin-password-setup.router.ts).
export function requestPasswordReset(personalEmail: string): Promise<string> {
  return api
    .post<{ message: string }>('/public/admin-password-setup/request', { personalEmail })
    .then((res) => res.data.message)
}
