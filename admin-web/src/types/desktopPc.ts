export type DesktopPcCategory = 'desktop' | 'mini_pc' | 'all_in_one' | 'ai_workstation' | 'ai_enterprise'
export type DesktopPcStatus = 'selling' | 'low_stock' | 'out_of_stock' | 'discontinued'

export interface DesktopPcSpecs {
  cpu: string
  gpu: string
  mainboard: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
  os: string
  warranty: string
}

export interface DesktopPc {
  id: string
  sku: string
  name: string
  category: DesktopPcCategory
  status: DesktopPcStatus
  specSummary: string
  price: number
  stock: number
  description: string
  highlights: string[]
  specs: DesktopPcSpecs
  updatedAt: string
}

export interface DesktopPcSummary {
  total: number
  selling: number
  lowStock: number
  discontinued: number
}
