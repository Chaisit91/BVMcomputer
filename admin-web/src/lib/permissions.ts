import type { AdminRole } from '../types/admin'

// ponytail: frontend-only gate (hides nav, redirects unauthorized routes).
// This is UX, not security — once Backend-web exists, every endpoint must
// re-check the same role rules server-side; a determined client can bypass
// anything enforced only here.
const sectionPrefixes: Partial<Record<AdminRole, string[]>> = {
  inventory_manager: ['/inventory'],
  sales_staff: ['/manage/orders', '/manage/users'],
  content_moderator: ['/manage/banners'],
}

const alwaysAllowedPrefixes = ['/dashboard']

export function canAccess(role: AdminRole | undefined, pathname: string): boolean {
  if (!role) return false
  if (role === 'super_admin') return true
  // Creating new admin accounts stays super_admin only; viewing/editing within
  // /admins is otherwise open to everyone — the page itself scopes what a
  // non-super_admin sees (their own department) and the backend enforces who
  // they can actually edit.
  if (pathname === '/admins/new') return false
  if (pathname.startsWith('/admins')) return true
  if (alwaysAllowedPrefixes.some((prefix) => pathname.startsWith(prefix))) return true
  return (sectionPrefixes[role] ?? []).some((prefix) => pathname.startsWith(prefix))
}
