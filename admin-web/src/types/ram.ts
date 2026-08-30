export type RamPublishStatus = 'active' | 'inactive'

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
