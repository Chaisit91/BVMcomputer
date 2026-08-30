import type { MotherboardFormValues } from '../schemas/motherboard.schema'
import type { Motherboard, MotherboardSummary } from '../types/motherboard'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const baseSpecs = {
  memorySlots: '4x DIMM',
  memoryType: 'DDR5',
  maxMemory: '128GB',
  maxMemorySpeed: 'DDR5-6400MHz',
  m2Slots: 'จำนวน M.2 slot 2',
  pcieSlots: 'จำนวน PCIe x16 slot 1',
  usbPorts: 'USB 3.2 Gen 2 Type-C',
  audio: 'Realtek ALC4080',
  lan: '2.5GbE',
  wifi: 'WiFi 6E',
  bluetooth: '5.3',
  warranty: '3 ปี',
}

const motherboards: Motherboard[] = [
  {
    id: '1', sku: 'MB-001', name: 'ASUS ROG STRIX B760-F GAMING WIFI', brand: 'ASUS',
    sellingPrice: 7890, costPrice: 6200, discount: 0, stock: 14, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: '14th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel B760', mainboardSupport: 'ATX', formFactor: 'ATX' },
    description: '', updatedAt: '20/08/2025',
  },
  {
    id: '2', sku: 'MB-002', name: 'GIGABYTE B650 AORUS ELITE AX', brand: 'GIGABYTE',
    sellingPrice: 6450, costPrice: 5100, discount: 0, stock: 21, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: 'AMD Ryzen 7000 Series', socket: 'AM5', chipset: 'AMD B650', mainboardSupport: 'ATX', formFactor: 'ATX', memoryType: 'DDR5' },
    description: '', updatedAt: '19/08/2025',
  },
  {
    id: '3', sku: 'MB-003', name: 'MSI MAG B760 TOMAHAWK WIFI', brand: 'MSI',
    sellingPrice: 5890, costPrice: 4700, discount: 0, stock: 2, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: '13th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel B760', mainboardSupport: 'ATX', formFactor: 'ATX' },
    description: '', updatedAt: '18/08/2025',
  },
  {
    id: '4', sku: 'MB-004', name: 'ASROCK B650 PG LIGHTNING', brand: 'ASROCK',
    sellingPrice: 4790, costPrice: 3800, discount: 0, stock: 35, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: 'AMD Ryzen 7000 Series', socket: 'AM5', chipset: 'AMD B650', mainboardSupport: 'ATX', formFactor: 'ATX', maxMemory: '96GB' },
    description: '', updatedAt: '17/08/2025',
  },
  {
    id: '5', sku: 'MB-005', name: 'ASUS PRIME H610M-E D4', brand: 'ASUS',
    sellingPrice: 2590, costPrice: 2000, discount: 0, stock: 0, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: '12th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel H610', mainboardSupport: 'Micro-ATX', formFactor: 'Micro-ATX', memoryType: 'DDR4', maxMemory: '64GB', memorySlots: '2x DIMM', wifi: 'ไม่มี', bluetooth: 'ไม่มี', lan: '1GbE' },
    description: '', updatedAt: '10/08/2025',
  },
  {
    id: '6', sku: 'MB-006', name: 'GIGABYTE X870 AORUS ELITE WIFI7', brand: 'GIGABYTE',
    sellingPrice: 13900, costPrice: 11500, discount: 0, stock: 8, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD X870', mainboardSupport: 'ATX', formFactor: 'ATX', maxMemory: '256GB' },
    description: '', updatedAt: '15/08/2025',
  },
  {
    id: '7', sku: 'MB-007', name: 'MSI MPG Z790 CARBON WIFI', brand: 'MSI',
    sellingPrice: 10200, costPrice: 8400, discount: 0, stock: 3, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: '14th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel Z790', mainboardSupport: 'ATX', formFactor: 'ATX', maxMemory: '192GB' },
    description: '', updatedAt: '14/08/2025',
  },
  {
    id: '8', sku: 'MB-008', name: 'COLORFUL CVN B760M FROZEN', brand: 'COLORFUL',
    sellingPrice: 4990, costPrice: 3900, discount: 0, stock: 18, publishImmediately: true,
    specs: { ...baseSpecs, cpuSupport: '13th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel B760', mainboardSupport: 'Micro-ATX', formFactor: 'Micro-ATX' },
    description: '', updatedAt: '12/08/2025',
  },
]

export function getMotherboardSummary(): Promise<MotherboardSummary> {
  return mockDelay({ totalModels: 289, totalStock: 1547, lowStock: 12, outOfStock: 3 })
}

export function getMotherboards(): Promise<Motherboard[]> {
  return mockDelay(motherboards)
}

export function getMotherboardDetail(id: string): Promise<Motherboard | null> {
  return mockDelay(motherboards.find((mb) => mb.id === id) ?? null)
}

export function saveMotherboard(_id: string, _data: MotherboardFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createMotherboard(_data: MotherboardFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(motherboards.length + 1) })
}

export function deleteMotherboard(_id: string): Promise<void> {
  return mockDelay(undefined)
}
