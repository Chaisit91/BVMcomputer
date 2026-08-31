export type CoolingPublishStatus = 'active' | 'inactive'

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
