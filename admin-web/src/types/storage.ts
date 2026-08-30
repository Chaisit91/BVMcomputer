export type StoragePublishStatus = 'active' | 'inactive'

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
