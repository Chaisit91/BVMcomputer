// 'available' never existed on the backend (ProductStatus is
// active|inactive|preorder|discontinued, plus low_stock|out_of_stock derived
// at read time from stock — see Backend-web/src/lib/stockStatus.ts) — widened
// to the real 6-value set, 'available' usages replaced with 'active'.
export type GpuStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface GpuSpecs {
  baseClock: string
  memoryClock: string
  hdmiPort: string
  displayPort: string
  openGl: string
  cudaCores: string
  powerConnector: string
  powerRequirement: string
  memoryInterface: string
  dimension: string
  boostClock: string
  warranty: string
  pcieInterface: string
}

export interface Gpu {
  id: string
  sku: string
  name: string
  brand: string
  series: string
  model: string
  chipsetModel: string
  memorySize: string
  sellingPrice: number
  stock: number
  status: GpuStatus
  specs: GpuSpecs
  description: string
  updatedAt: string
}

export interface GpuSummary {
  total: number
}
