export interface CpuBenchmark {
  id: string
  name: string
  score: number
  unit: string
}

// 4 values are stored (admin-controlled); low_stock/out_of_stock are derived
// server-side from `stock` and only ever appear on reads, never sent back.
export type CpuStatus = 'active' | 'inactive' | 'preorder' | 'discontinued' | 'low_stock' | 'out_of_stock'

export interface Cpu {
  id: string
  sku: string
  name: string
  brand: 'AMD' | 'Intel'
  series: string
  processorLine: string
  socket: string
  processorNumber: string
  cores: number
  threads: number
  baseFrequencyGhz: number
  maxTurboFrequencyGhz: number
  l2CacheMb: number
  l3CacheMb: number
  graphics: string
  tdpWatts: number
  maxTdpWatts: number
  warrantyMonths: number
  sellingPrice: number
  costPrice: number | null
  promoPrice: number | null
  stock: number
  status: CpuStatus
  publishImmediately: boolean
  benchmarks: CpuBenchmark[]
  videoLinks: string[]
  description: string
}

export interface CpuSummary {
  total: number
  totalStock: number
  lowStock: number
  outOfStock: number
}
