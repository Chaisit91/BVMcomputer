import type { ComponentSlot } from './componentSlots'

// Matches backend BuildStatus exactly (prisma/schema.prisma) — no reconciling needed here.
export type BuildStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'

export interface CustomBuildComponents {
  cpu: string
  gpu: string
  motherboard: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
}

export interface CustomBuildPrices {
  cpu: number
  gpu: number
  motherboard: number
  ram: number
  storage: number
  psu: number
  case: number
  cooling: number
}

// The backend's shape() returns this SAME nested shape for both findMany()
// (list) and findById() (detail) — one type covers both, unlike the old mock's
// CustomBuildOrder (flat list row) / CustomBuildDetail (nested detail) split.
export interface CustomBuild {
  id: string
  orderNo: string
  customer: string
  status: BuildStatus
  components: CustomBuildComponents
  // slot -> real Product id, e.g. { cpu: 'ck1...' } — resolves each
  // ProductPicker's current selection on the edit form.
  componentIds: Record<ComponentSlot, string>
  prices: CustomBuildPrices
  total: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CustomBuildSummary {
  total: number
  pending: number
  done: number
  cancelled: number
}
