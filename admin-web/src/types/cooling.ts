// Widened to the backend's real ProductStatus set (active|inactive|preorder|
// discontinued) plus the two read-only derived labels (low_stock|out_of_stock)
// computed from stock at read time — see Backend-web/src/lib/stockStatus.ts.
export type CoolingPublishStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface CoolingSpecs {
  coolingType: string
  socketSupport: string
  radiatorSize: string
  fanSize: string
  fanSpeed: string
  noiseLevel: string
  tdpRating: string
  rgb: string
  warranty: string
}

export interface ExtraSpec {
  id: string
  name: string
  detail: string
}

export interface Cooling {
  id: string
  displayCode: string
  sku: string
  name: string
  brand: string
  sellingPrice: number
  promoEnabled: boolean
  promoPrice: number
  stock: number
  status: CoolingPublishStatus
  specs: CoolingSpecs
  extraSpecs: ExtraSpec[]
  videoLinks: string[]
  description: string
  updatedAt: string
}

export interface CoolingSummary {
  totalModels: number
  activeRatePercent: number
  lowStockCount: number
  outOfStockCount: number
}
