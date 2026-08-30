export type MotherboardStatus = 'available' | 'low_stock' | 'out_of_stock'

export interface MotherboardSpecs {
  cpuSupport: string
  socket: string
  chipset: string
  mainboardSupport: string
  memorySlots: string
  memoryType: string
  maxMemory: string
  maxMemorySpeed: string
  formFactor: string
  m2Slots: string
  pcieSlots: string
  usbPorts: string
  audio: string
  lan: string
  wifi: string
  bluetooth: string
  warranty: string
}

export interface Motherboard {
  id: string
  sku: string
  name: string
  brand: string
  sellingPrice: number
  costPrice: number
  discount: number
  stock: number
  publishImmediately: boolean
  specs: MotherboardSpecs
  description: string
  updatedAt: string
}

export interface MotherboardSummary {
  totalModels: number
  totalStock: number
  lowStock: number
  outOfStock: number
}
