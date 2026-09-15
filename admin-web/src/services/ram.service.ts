import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { RamFormValues } from '../schemas/ram.schema'
import type { ExtraSpec, Ram } from '../types/ram'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Sample catalog for previewing the UI while the real Supabase catalog is
// still empty — matches the current Ram shape exactly. Remove/ignore once
// USE_MOCK_DATA is flipped back to false in lib/mockMode.ts.
const mockRams: Ram[] = [
  {
    id: 'mock-ram-1',
    sku: 'RAM-COR-VENG16',
    name: 'Corsair Vengeance RGB 16GB (2x8GB) DDR5 6000MHz',
    brand: 'Corsair',
    series: 'Vengeance RGB',
    sellingPrice: 2590,
    promoEnabled: false,
    promoPrice: 0,
    stock: 50,
    status: 'active',
    specs: {
      memoryType: 'DDR5',
      capacity: '16GB (2x8GB)',
      speed: '6000MHz',
      voltage: '1.35V',
      casLatency: 'CL36',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'แรมความเร็วสูงพร้อมไฟ RGB สำหรับเกมเมอร์และสายแต่งคอม',
    updatedAt: '2026-06-10T10:00:00.000Z',
  },
  {
    id: 'mock-ram-2',
    sku: 'RAM-KIN-FURY32',
    name: 'Kingston FURY Beast 32GB (2x16GB) DDR5 5600MHz',
    brand: 'Kingston',
    series: 'FURY Beast',
    sellingPrice: 4290,
    promoEnabled: true,
    promoPrice: 3890,
    stock: 30,
    status: 'active',
    specs: {
      memoryType: 'DDR5',
      capacity: '32GB (2x16GB)',
      speed: '5600MHz',
      voltage: '1.25V',
      casLatency: 'CL40',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'ไม่มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ความจุสูงเหมาะกับงานมัลติทาสก์และตัดต่อวิดีโอ',
    updatedAt: '2026-05-22T10:00:00.000Z',
  },
  {
    id: 'mock-ram-3',
    sku: 'RAM-GSK-TRID16',
    name: 'G.Skill Trident Z5 RGB 16GB (2x8GB) DDR5 6400MHz',
    brand: 'G.Skill',
    series: 'Trident Z5 RGB',
    sellingPrice: 3190,
    promoEnabled: false,
    promoPrice: 0,
    stock: 18,
    status: 'active',
    specs: {
      memoryType: 'DDR5',
      capacity: '16GB (2x8GB)',
      speed: '6400MHz',
      voltage: '1.4V',
      casLatency: 'CL32',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'โอเวอร์คล็อกง่าย ดีไซน์พรีเมียมพร้อมไฟ ARGB สวยงาม',
    updatedAt: '2026-04-18T10:00:00.000Z',
  },
  {
    id: 'mock-ram-4',
    sku: 'RAM-COR-VENG8',
    name: 'Corsair Vengeance LPX 8GB DDR4 3200MHz',
    brand: 'Corsair',
    series: 'Vengeance LPX',
    sellingPrice: 890,
    promoEnabled: false,
    promoPrice: 0,
    stock: 5,
    status: 'low_stock',
    specs: {
      memoryType: 'DDR4',
      capacity: '8GB',
      speed: '3200MHz',
      voltage: '1.35V',
      casLatency: 'CL16',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'ไม่มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ตัวเลือกประหยัดสำหรับอัปเกรดคอมทั่วไปบนแพลตฟอร์ม DDR4',
    updatedAt: '2026-02-14T10:00:00.000Z',
  },
  {
    id: 'mock-ram-5',
    sku: 'RAM-ADA-CAST32',
    name: 'ADATA XPG Caster 32GB (2x16GB) DDR5 6000MHz',
    brand: 'ADATA',
    series: 'XPG Caster',
    sellingPrice: 4590,
    promoEnabled: true,
    promoPrice: 4190,
    stock: 0,
    status: 'out_of_stock',
    specs: {
      memoryType: 'DDR5',
      capacity: '32GB (2x16GB)',
      speed: '6000MHz',
      voltage: '1.35V',
      casLatency: 'CL30',
      warranty: '10 ปี',
      heatSpreader: 'มี',
      rgbLighting: 'มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ระบายความร้อนดีด้วยฮีทสิงค์อลูมิเนียม เหมาะกับสายโอเวอร์คล็อก',
    updatedAt: '2026-03-30T10:00:00.000Z',
  },
  {
    id: 'mock-ram-6',
    sku: 'RAM-TFO-GAM16',
    name: 'TeamGroup T-Force Delta RGB 16GB (2x8GB) DDR4 3600MHz',
    brand: 'TeamGroup',
    series: 'T-Force Delta RGB',
    sellingPrice: 1790,
    promoEnabled: false,
    promoPrice: 0,
    stock: 40,
    status: 'active',
    specs: {
      memoryType: 'DDR4',
      capacity: '16GB (2x8GB)',
      speed: '3600MHz',
      voltage: '1.35V',
      casLatency: 'CL18',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'สมดุลราคาและประสิทธิภาพ พร้อมไฟ RGB สไตล์เกมเมอร์',
    updatedAt: '2026-05-05T10:00:00.000Z',
  },
  {
    id: 'mock-ram-7',
    sku: 'RAM-COR-DOM64',
    name: 'Corsair Dominator Platinum RGB 64GB (2x32GB) DDR5 6000MHz',
    brand: 'Corsair',
    series: 'Dominator Platinum RGB',
    sellingPrice: 10900,
    promoEnabled: false,
    promoPrice: 0,
    stock: 7,
    status: 'preorder',
    specs: {
      memoryType: 'DDR5',
      capacity: '64GB (2x32GB)',
      speed: '6000MHz',
      voltage: '1.35V',
      casLatency: 'CL30',
      warranty: 'Lifetime',
      heatSpreader: 'มี',
      rgbLighting: 'มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ความจุสูงระดับเวิร์คสเตชัน เหมาะสำหรับงานตัดต่อ 8K และ 3D rendering',
    updatedAt: '2026-06-13T10:00:00.000Z',
  },
  {
    id: 'mock-ram-8',
    sku: 'RAM-KIN-VAL8',
    name: 'Kingston ValueRAM 8GB DDR4 2666MHz',
    brand: 'Kingston',
    series: 'ValueRAM',
    sellingPrice: 590,
    promoEnabled: false,
    promoPrice: 0,
    stock: 2,
    status: 'discontinued',
    specs: {
      memoryType: 'DDR4',
      capacity: '8GB',
      speed: '2666MHz',
      voltage: '1.2V',
      casLatency: 'CL19',
      warranty: '2 ปี',
      heatSpreader: 'ไม่มี',
      rgbLighting: 'ไม่มี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'แรมพื้นฐานสำหรับคอมสำนักงาน (เลิกจำหน่าย เหลือสต็อกน้อย)',
    updatedAt: '2025-11-20T10:00:00.000Z',
  },
]

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Ram {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getRams(): Promise<Ram[]> {
  if (USE_MOCK_DATA) return mockDelay(mockRams)
  return api.get<Ram[]>('/rams').then((res) => res.data.map(fromApi))
}

export function getRamDetail(id: string): Promise<Ram | null> {
  if (USE_MOCK_DATA) return mockDelay(mockRams.find((ram) => ram.id === id) ?? null)
  return api
    .get<Ram>(`/rams/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveRam(
  id: string,
  data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/rams/${id}`, toApiBody(data)).then(() => undefined)
}

export function createRam(
  data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-ram-${Date.now()}` })
  return api.post<Ram>('/rams', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteRam(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/rams/${id}`).then(() => undefined)
}
