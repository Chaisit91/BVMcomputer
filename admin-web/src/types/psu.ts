export type PsuPublishStatus = 'active' | 'inactive'

export interface PsuSpecs {
  continuousPower: string
  certification: string
  modularity: string
  formFactor: string
  fanSize: string
  connectors: string
  protection: string
  warranty: string
}

export interface ExtraSpec {
  id: string
  name: string
  detail: string
}

export interface Psu {
  id: string
  displayCode: string
  sku: string
  name: string
  brand: string
  sellingPrice: number
  promoEnabled: boolean
  promoPrice: number
  stock: number
  status: PsuPublishStatus
  specs: PsuSpecs
  extraSpecs: ExtraSpec[]
  videoLinks: string[]
  description: string
  updatedAt: string
}

export interface PsuSummary {
  totalModels: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
}
