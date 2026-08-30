export type GpuStatus = 'available' | 'preorder' | 'discontinued'

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
  price: number
  stock: number
  status: GpuStatus
  specs: GpuSpecs
  description: string
  updatedAt: string
}

export interface GpuSummary {
  total: number
}
