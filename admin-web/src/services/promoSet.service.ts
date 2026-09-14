import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { PromoSetFormValues } from '../schemas/promoSet.schema'
import type { PromoSet, PromoSetExtraPart } from '../types/promoSet'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Backend Product fields serialize as Decimal -> string over JSON, and
// `promoPrice` is nullable (null = no active promo). Coerce to numbers here
// and derive the display-safe promoPrice + promoEnabled toggle once.
function fromApi(raw: any): PromoSet {
  const promoEnabled = toPromoEnabled(raw.promoPrice)
  const regularPrice = Number(raw.sellingPrice)
  return {
    ...raw,
    regularPrice,
    promoEnabled,
    promoPrice: promoEnabled ? Number(raw.promoPrice) : regularPrice,
  }
}

const mockComponents = (overrides: Partial<PromoSet['components']> = {}) => ({
  cpu: 'Intel Core i5-14400F',
  motherboard: 'ASUS PRIME B760M-A',
  gpu: 'RTX 4060 8GB',
  ram: 'DDR5 16GB (8x2) 5600MHz',
  storage: 'NVMe SSD 1TB Gen4',
  psu: '650W 80+ Bronze',
  case: 'Mid Tower ATX RGB',
  cooling: 'Air Cooler Tower 4 Heatpipe',
  ...overrides,
})

const mockComponentIds = (idx: number) => ({
  cpu: `mock-cpu-${idx}`, motherboard: `mock-mb-${idx}`, gpu: `mock-gpu-${idx}`, ram: `mock-ram-${idx}`,
  storage: `mock-storage-${idx}`, psu: `mock-psu-${idx}`, case: `mock-case-${idx}`, cooling: `mock-cooling-${idx}`,
})

const MOCK_PROMO_SETS: PromoSet[] = [
  {
    id: 'mock-promo-1',
    code: 'PROMO-SEPT-01',
    name: 'ชุดโปรเดือนกันยา เกมมิ่งคุ้มค่า',
    status: 'active',
    specSummary: 'i5-14400F / RTX 4060 8GB / 16GB DDR5',
    regularPrice: 29900,
    promoEnabled: true,
    promoPrice: 26900,
    stock: 18,
    publishImmediately: true,
    components: mockComponents(),
    componentIds: mockComponentIds(1),
    extraParts: [{ id: 'ep-1', name: 'คีย์บอร์ด+เมาส์', value: 'ของแถม' }],
    description: 'ชุดโปรโมชั่นสุดคุ้ม เล่นเกมลื่นทุกเกมดัง',
    highlights: ['ลดทันที 3,000 บาท', 'ฟรีคีย์บอร์ดเมาส์', 'ผ่อน 0% 10 เดือน'],
    videoLinks: ['https://youtube.com/watch?v=mockpromo1'],
    notes: 'โปรถึงสิ้นเดือนกันยายน',
    updatedAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'mock-promo-2',
    code: 'PROMO-STUDENT-02',
    name: 'ชุดนักเรียนนักศึกษา เรียนออนไลน์ลื่น',
    status: 'active',
    specSummary: 'i3-14100 / Intel UHD 730 / 8GB DDR4',
    regularPrice: 13900,
    promoEnabled: false,
    promoPrice: 13900,
    stock: 40,
    publishImmediately: true,
    components: mockComponents({ cpu: 'Intel Core i3-14100', gpu: 'Intel UHD Graphics 730', ram: 'DDR4 8GB' }),
    componentIds: mockComponentIds(2),
    extraParts: [],
    description: 'เหมาะสำหรับงานเอกสารและเรียนออนไลน์',
    highlights: ['ราคาประหยัด', 'เหมาะสำหรับนักเรียน'],
    videoLinks: [],
    notes: '',
    updatedAt: '2026-09-02T09:00:00.000Z',
  },
  {
    id: 'mock-promo-3',
    code: 'PROMO-CONTENT-03',
    name: 'ชุดทำคอนเทนต์ ตัดต่อลื่นไหล',
    status: 'low_stock',
    specSummary: 'Ryzen 7 7700 / RTX 4070 12GB / 32GB DDR5',
    regularPrice: 45900,
    promoEnabled: true,
    promoPrice: 41900,
    stock: 4,
    publishImmediately: true,
    components: mockComponents({ cpu: 'AMD Ryzen 7 7700', gpu: 'RTX 4070 12GB', ram: 'DDR5 32GB (16x2) 6000MHz' }),
    componentIds: mockComponentIds(3),
    extraParts: [{ id: 'ep-2', name: 'จอมอนิเตอร์ 27"', value: 'ราคาพิเศษ +3,900' }],
    description: 'สเปคแรงสำหรับสายตัดต่อวิดีโอและกราฟิก',
    highlights: ['เรนเดอร์เร็วขึ้น 2 เท่า', 'รองรับ Adobe Premiere/DaVinci Resolve'],
    videoLinks: ['https://youtube.com/watch?v=mockpromo3'],
    notes: 'เหลือสต็อกน้อย',
    updatedAt: '2026-09-06T13:30:00.000Z',
  },
  {
    id: 'mock-promo-4',
    code: 'PROMO-OFFICE-04',
    name: 'ชุดออฟฟิศประหยัดไฟ',
    status: 'inactive',
    specSummary: 'i5-13400 / Intel UHD 730 / 16GB DDR4',
    regularPrice: 17900,
    promoEnabled: false,
    promoPrice: 17900,
    stock: 10,
    publishImmediately: false,
    components: mockComponents({ cpu: 'Intel Core i5-13400', gpu: 'Intel UHD Graphics 730' }),
    componentIds: mockComponentIds(4),
    extraParts: [],
    description: 'ยังไม่เปิดขาย รอปรับราคา',
    highlights: ['ประหยัดไฟ', 'เงียบ'],
    videoLinks: [],
    notes: 'พักการขายชั่วคราว',
    updatedAt: '2026-08-25T15:00:00.000Z',
  },
  {
    id: 'mock-promo-5',
    code: 'PROMO-STREAM-05',
    name: 'ชุดสตรีมเมอร์ เล่นสดลื่นไม่มีสะดุด',
    status: 'preorder',
    specSummary: 'Ryzen 9 7900X / RTX 4080 SUPER 16GB / 32GB DDR5',
    regularPrice: 68900,
    promoEnabled: true,
    promoPrice: 63900,
    stock: 0,
    publishImmediately: true,
    components: mockComponents({ cpu: 'AMD Ryzen 9 7900X', gpu: 'RTX 4080 SUPER 16GB', ram: 'DDR5 32GB (16x2) 6200MHz' }),
    componentIds: mockComponentIds(5),
    extraParts: [{ id: 'ep-3', name: 'กล้องเว็บแคม 4K', value: 'ของแถม' }],
    description: 'สั่งจองล่วงหน้า จัดส่งภายใน 2 สัปดาห์',
    highlights: ['เล่นเกมพร้อมสตรีมได้ลื่น', 'รองรับ OBS/Streamlabs'],
    videoLinks: ['https://youtube.com/watch?v=mockpromo5'],
    notes: 'พรีออเดอร์รอบใหม่',
    updatedAt: '2026-09-11T09:00:00.000Z',
  },
  {
    id: 'mock-promo-6',
    code: 'PROMO-OLD-06',
    name: 'ชุดโปรเก่า เคลียร์สต็อก',
    status: 'discontinued',
    specSummary: 'Ryzen 5 5600G / Vega 7 / 8GB DDR4',
    regularPrice: 11900,
    promoEnabled: false,
    promoPrice: 11900,
    stock: 0,
    publishImmediately: false,
    components: mockComponents({ cpu: 'AMD Ryzen 5 5600G', gpu: 'AMD Radeon Vega 7', ram: 'DDR4 8GB' }),
    componentIds: mockComponentIds(6),
    extraParts: [],
    description: 'เลิกจำหน่ายแล้ว',
    highlights: [],
    videoLinks: [],
    notes: '',
    updatedAt: '2026-05-10T10:00:00.000Z',
  },
]

export function getPromoSets(): Promise<PromoSet[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_PROMO_SETS)
  return api.get<any[]>('/promo-sets').then((res) => res.data.map(fromApi))
}

export function getPromoSetDetail(id: string): Promise<PromoSet | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_PROMO_SETS.find((item) => item.id === id) ?? null)
  return api
    .get<any>(`/promo-sets/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

type PromoSetSubmitValues = PromoSetFormValues & {
  highlights: string[]
  videoLinks: string[]
  extraParts: PromoSetExtraPart[]
}

function toApiBody(data: PromoSetSubmitValues) {
  const { regularPrice, promoEnabled, promoPrice, status, ...rest } = data
  // low_stock/out_of_stock are derived server-side from stock count, never a
  // real stored value — omit `status` entirely when it's one of those so the
  // stored value (active/etc) is left untouched, same as Desktop PC.
  const isDerivedStatus = status === 'low_stock' || status === 'out_of_stock'
  return {
    ...rest,
    // PromoSet.code doubles as the underlying Product's `sku` — the frontend
    // has no separate sku field for promo sets, and code is already a
    // required, unique identifier, so it satisfies Product.sku's constraint.
    sku: rest.code,
    sellingPrice: regularPrice,
    promoPrice: toPromoPriceField(promoEnabled, promoPrice),
    ...(isDerivedStatus ? {} : { status }),
  }
}

export function savePromoSet(id: string, data: PromoSetSubmitValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/promo-sets/${id}`, toApiBody(data)).then(() => undefined)
}

export function createPromoSet(data: PromoSetSubmitValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-promo-${Date.now()}` })
  return api.post<{ id: string }>('/promo-sets', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deletePromoSet(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/promo-sets/${id}`).then(() => undefined)
}
