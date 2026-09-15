import type { BannerStatus } from '../types/banner'

// Backend only stores `active: boolean` — 'expired' is a read-time derivation
// (endDate in the past) the schema documents but never implements. Do it here.
export function deriveBannerStatus(active: boolean, endDate: string | null | undefined): BannerStatus {
  if (!active) return 'inactive'
  if (endDate && new Date(endDate) < new Date()) return 'expired'
  return 'active'
}
