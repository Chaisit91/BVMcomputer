// Widened to the backend's real ProductStatus set (active|inactive|preorder|
// discontinued) plus the two read-only derived labels (low_stock|out_of_stock)
// computed from stock at read time — see Backend-web/src/lib/stockStatus.ts.
export type RamPublishStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface RamSpecs {
  memoryType: string
  capacity: string
  speed: string
  voltage: string
  casLatency: string
  warranty: string
  heatSpreader: string
  rgbLighting: string
}

export interface ExtraSpec {
  id: string
  name: string
  detail: string
}

export interface Ram {
  id: string
  sku: string
  name: string
  brand: string
  series: string
  sellingPrice: number
  promoEnabled: boolean
  promoPrice: number
  stock: number
  status: RamPublishStatus
  specs: RamSpecs
  extraSpecs: ExtraSpec[]
  videoLinks: string[]
  description: string
  updatedAt: string
}

export interface RamSummary {
  totalModels: number
  activeRatePercent: number
  totalStock: number
  totalBrands: number
}
