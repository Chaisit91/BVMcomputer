export interface CpuBenchmark {
  id: string
  name: string
  score: string
  unit: string
}

export interface Cpu {
  id: string
  sku: string
  name: string
  brand: 'AMD' | 'Intel'
  series: string
  processorLine: string
  socket: string
  processorNumber: string
  coresThreads: string
  baseFrequency: string
  maxTurboFrequency: string
  l2Cache: string
  l3Cache: string
  graphics: string
  tdp: string
  maxTdp: string
  warranty: string
  sellingPrice: number
  costPrice: number
  discount: number
  stock: number
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
