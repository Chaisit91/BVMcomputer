import type { ComponentSlot } from './componentSlots'

export type ComputerUpgradeStatus = 'pending_review' | 'in_progress' | 'completed' | 'cancelled'

export interface ComputerUpgradeItem {
  id: string
  slot: ComponentSlot
  oldItemDescription: string
  oldItemPhotoUrl: string | null
  // Customer's stated intent from their own submission (once the storefront
  // exists) — "I want this slot upgraded" — separate from newProductId,
  // which is the admin's/AI's actual catalog resolution of that request.
  customerWantsUpgrade: boolean
  newProductId: string | null
  newProductName: string | null
  newProductSku: string | null
  newProductPrice: number | null
  aiRecommendation: string | null
  verifiedByAdmin: boolean
  verifiedAt: string | null
  verifiedByName: string | null
}

export interface ComputerUpgrade {
  id: string
  customerId: string | null
  customerNameSnapshot: string
  customerName: string
  status: ComputerUpgradeStatus
  notes: string
  createdAt: string
  updatedAt: string
  items: ComputerUpgradeItem[]
}

export interface ComputerUpgradeSummary {
  total: number
  pendingReview: number
  inProgress: number
  completed: number
}

export const computerUpgradeStatusMeta: Record<ComputerUpgradeStatus, { label: string; badgeClass: string }> = {
  pending_review: { label: 'รอตรวจสอบ', badgeClass: 'bg-amber-50 text-amber-600' },
  in_progress: { label: 'กำลังดำเนินการ', badgeClass: 'bg-blue-50 text-blue-600' },
  completed: { label: 'เสร็จสิ้น', badgeClass: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: 'ยกเลิก', badgeClass: 'bg-gray-100 text-gray-500' },
}
