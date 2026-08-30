import type { RamFormValues } from '../schemas/ram.schema'
import type { ExtraSpec, Ram, RamSummary } from '../types/ram'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const rams: Ram[] = [
  { id: '1', sku: 'RAM-001', name: 'CORSAIR VENGEANCE RGB DDR5 32GB (16GBx2) 6000MHz', brand: 'CORSAIR', series: 'VENGEANCE RGB', sellingPrice: 4590, promoEnabled: false, promoPrice: 0, stock: 24, status: 'active', specs: { memoryType: 'DDR5', capacity: '32GB (16GBx2)', speed: '6000MHz', voltage: '1.35V', casLatency: 'CL30-36-36-76', warranty: 'Lifetime', heatSpreader: 'มี', rgbLighting: 'มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '20/08/2025' },
  { id: '2', sku: 'RAM-002', name: 'KINGSTON FURY BEAST RGB DDR4 16GB (8GBx2) 3200MHz', brand: 'KINGSTON', series: 'FURY BEAST', sellingPrice: 2190, promoEnabled: false, promoPrice: 0, stock: 45, status: 'active', specs: { memoryType: 'DDR4', capacity: '16GB (8GBx2)', speed: '3200MHz', voltage: '1.35V', casLatency: 'CL16-18-18-36', warranty: 'Lifetime', heatSpreader: 'มี', rgbLighting: 'มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '19/08/2025' },
  { id: '3', sku: 'RAM-003', name: 'APACER PANTHER RGB DDR5 32GB (16GBx2) 5600MHz', brand: 'APACER', series: 'PANTHER RGB', sellingPrice: 3890, promoEnabled: false, promoPrice: 0, stock: 3, status: 'active', specs: { memoryType: 'DDR5', capacity: '32GB (16GBx2)', speed: '5600MHz', voltage: '1.25V', casLatency: 'CL36-38-38-76', warranty: '3 Years', heatSpreader: 'มี', rgbLighting: 'มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '18/08/2025' },
  { id: '4', sku: 'RAM-004', name: 'LEXAR THOR DDR4 16GB (8GBx2) 3200MHz', brand: 'LEXAR', series: 'THOR', sellingPrice: 1450, promoEnabled: false, promoPrice: 0, stock: 12, status: 'active', specs: { memoryType: 'DDR4', capacity: '16GB (8GBx2)', speed: '3200MHz', voltage: '1.35V', casLatency: 'CL16-20-20-38', warranty: '3 Years', heatSpreader: 'มี', rgbLighting: 'ไม่มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '17/08/2025' },
  { id: '5', sku: 'RAM-005', name: 'KINGBANK SHARP DDR5 16GB (16GBx1) 6400MHz', brand: 'KINGBANK', series: 'SHARP', sellingPrice: 2090, promoEnabled: false, promoPrice: 0, stock: 0, status: 'active', specs: { memoryType: 'DDR5', capacity: '16GB (16GBx1)', speed: '6400MHz', voltage: '1.35V', casLatency: 'CL32-39-39-102', warranty: '3 Years', heatSpreader: 'มี', rgbLighting: 'ไม่มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '10/08/2025' },
  { id: '6', sku: 'RAM-006', name: 'ADATA XPG LANCER BLADE DDR5 32GB (16GBx2) 6000MHz', brand: 'ADATA', series: 'XPG LANCER BLADE', sellingPrice: 4290, promoEnabled: false, promoPrice: 0, stock: 18, status: 'active', specs: { memoryType: 'DDR5', capacity: '32GB (16GBx2)', speed: '6000MHz', voltage: '1.35V', casLatency: 'CL30-36-36-76', warranty: 'Lifetime', heatSpreader: 'มี', rgbLighting: 'มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '15/08/2025' },
  { id: '7', sku: 'RAM-007', name: 'COLORFIRE MEOW DDR4 8GB (8GBx1) 3200MHz', brand: 'COLORFIRE', series: 'MEOW', sellingPrice: 990, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active', specs: { memoryType: 'DDR4', capacity: '8GB (8GBx1)', speed: '3200MHz', voltage: '1.2V', casLatency: 'CL16-20-20-38', warranty: '3 Years', heatSpreader: 'ไม่มี', rgbLighting: 'ไม่มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '14/08/2025' },
  { id: '8', sku: 'RAM-008', name: 'CORSAIR VENGEANCE LPX DDR4 8GB 3200MHz', brand: 'CORSAIR', series: 'VENGEANCE LPX', sellingPrice: 1150, promoEnabled: false, promoPrice: 0, stock: 82, status: 'active', specs: { memoryType: 'DDR4', capacity: '8GB (8GBx1)', speed: '3200MHz', voltage: '1.2V', casLatency: 'CL16-18-18-36', warranty: 'Lifetime', heatSpreader: 'มี', rgbLighting: 'ไม่มี' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '12/08/2025' },
]

export function getRamSummary(): Promise<RamSummary> {
  return mockDelay({ totalModels: 315, activeRatePercent: 98.5, totalStock: 1842, totalBrands: 8 })
}

export function getRams(): Promise<Ram[]> {
  return mockDelay(rams)
}

export function getRamDetail(id: string): Promise<Ram | null> {
  return mockDelay(rams.find((ram) => ram.id === id) ?? null)
}

export function saveRam(
  _id: string,
  _data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createRam(
  _data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(rams.length + 1) })
}

export function deleteRam(_id: string): Promise<void> {
  return mockDelay(undefined)
}
