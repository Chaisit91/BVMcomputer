// Widened to the backend's real ProductStatus set (active|inactive|preorder|
// discontinued) plus the two read-only derived labels (low_stock|out_of_stock)
// computed from stock at read time — see Backend-web/src/lib/stockStatus.ts.
export type StoragePublishStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface StorageSpecs {
  type: string
  capacity: string
  interface: string
  formFactor: string
  sequentialRead: string
  sequentialWrite: string
  cacheMemory: string
  mtbf: string
  warranty: string
}

export interface ExtraSpec {
  id: string
  name: string
  detail: string
}

export interface Storage {
  id: string
  sku: string
  name: string
  brand: string
  sellingPrice: number
  promoEnabled: boolean
  promoPrice: number
  stock: number
  status: StoragePublishStatus
  specs: StorageSpecs
  extraSpecs: ExtraSpec[]
  videoLinks: string[]
  description: string
  updatedAt: string
}

export interface StorageSummary {
  totalModels: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
}
