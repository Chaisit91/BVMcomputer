// Widened to the backend's real ProductStatus set (active|inactive|preorder|
// discontinued) plus the two read-only derived labels (low_stock|out_of_stock)
// computed from stock at read time — see Backend-web/src/lib/stockStatus.ts.
export type CasePublishStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface CaseSpecs {
  mbSupport: string
  caseType: string
  sidePanel: string
  dimensions: string
  weight: string
  driveBays: string
  fanSupport: string
  radiatorSupport: string
  ioPorts: string
  warranty: string
}

export interface ExtraSpec {
  id: string
  name: string
  detail: string
}

export interface Case {
  id: string
  displayCode: string
  sku: string
  name: string
  brand: string
  sellingPrice: number
  promoEnabled: boolean
  promoPrice: number
  stock: number
  status: CasePublishStatus
  specs: CaseSpecs
  extraSpecs: ExtraSpec[]
  videoLinks: string[]
  description: string
  updatedAt: string
}

export interface CaseSummary {
  totalModels: number
  activeRatePercent: number
  totalStock: number
  lowStockCount: number
}
