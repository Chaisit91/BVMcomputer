import type { ComponentSlot } from './componentSlots'

// Matches backend ProductStatus (active/inactive/preorder/discontinued,
// stored) plus low_stock/out_of_stock (derived server-side from stock count)
// — same widening as DesktopPcStatus, the frontend's old 3-value
// 'selling'|'out_of_stock'|'closed' had no backend equivalent at all.
export type PromoSetStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface PromoSetComponents {
  cpu: string
  motherboard: string
  gpu: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
}

export interface PromoSetExtraPart {
  id: string
  name: string
  value: string
}

export interface PromoSet {
  id: string
  code: string
  name: string
  status: PromoSetStatus
  specSummary: string
  regularPrice: number
  // Backend `promoPrice` is nullable (null = no active promo). `promoEnabled`
  // reflects that raw nullability; `promoPrice` here is always a display-safe
  // number (falls back to regularPrice when there's no active promo) so
  // existing "฿x" renders don't need null checks everywhere.
  promoEnabled: boolean
  promoPrice: number
  stock: number
  publishImmediately: boolean
  components: PromoSetComponents
  // slot -> real Product id, e.g. { cpu: 'ck1...' } — resolves each
  // ProductPicker's current selection on the edit form.
  componentIds: Record<ComponentSlot, string>
  extraParts: PromoSetExtraPart[]
  description: string
  highlights: string[]
  videoLinks: string[]
  notes: string
  updatedAt: string
}

export interface PromoSetSummary {
  total: number
  selling: number
  lowStock: number
  discontinued: number
}
