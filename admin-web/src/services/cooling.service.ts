import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { CoolingFormValues } from '../schemas/cooling.schema'
import type { Cooling, ExtraSpec } from '../types/cooling'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockCoolers: Cooling[] = [
  {
    id: 'cool-1', displayCode: 'COOL-001', sku: 'CO-DC-AK620', name: 'DeepCool AK620', brand: 'DEEPCOOL',
    sellingPrice: 1590, promoEnabled: true, promoPrice: 1390, stock: 25, status: 'active',
    specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '-', fanSize: '120mm x2', fanSpeed: '500-1850 RPM', noiseLevel: '28 dBA', tdpRating: '260W', rgb: 'ไม่มี', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ทาวเวอร์คู่ ระบายความร้อนดีเยี่ยม เสียงเงียบ', updatedAt: '2026-08-13T10:00:00Z',
  },
  {
    id: 'cool-2', displayCode: 'COOL-002', sku: 'CO-CS-H100I', name: 'Corsair iCUE H100i Elite', brand: 'CORSAIR',
    sellingPrice: 4990, promoEnabled: false, promoPrice: 0, stock: 10, status: 'active',
    specs: { coolingType: 'AIO Liquid 240mm', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '240mm', fanSize: '120mm x2', fanSpeed: '400-2100 RPM', noiseLevel: '10-36 dBA', tdpRating: '250W', rgb: 'มี RGB', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'วอเตอร์คูลลิ่งพร้อมจอ LCD แสดงอุณหภูมิ', updatedAt: '2026-08-09T10:00:00Z',
  },
  {
    id: 'cool-3', displayCode: 'COOL-003', sku: 'CO-NC-NHD15', name: 'Noctua NH-D15', brand: 'NOCTUA',
    sellingPrice: 3690, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active',
    specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '-', fanSize: '140mm x2', fanSpeed: '300-1500 RPM', noiseLevel: '24.6 dBA', tdpRating: '250W', rgb: 'ไม่มี', warranty: '6 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ตำนานฮีทซิงค์ลม ระบายความร้อนระดับท็อป', updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'cool-4', displayCode: 'COOL-004', sku: 'CO-CM-ML360', name: 'Cooler Master MasterLiquid ML360', brand: 'CORSAIR',
    sellingPrice: 5490, promoEnabled: true, promoPrice: 4790, stock: 2, status: 'low_stock',
    specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '650-2000 RPM', noiseLevel: '8-30 dBA', tdpRating: '300W', rgb: 'มี ARGB', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'หม้อน้ำ 360mm ระบายความร้อนแรงสำหรับซีพียูตัวแรง', updatedAt: '2026-07-27T10:00:00Z',
  },
  {
    id: 'cool-5', displayCode: 'COOL-005', sku: 'CO-ID-SE224', name: 'ID-Cooling SE-224-XT', brand: 'ID-COOLING',
    sellingPrice: 790, promoEnabled: false, promoPrice: 0, stock: 40, status: 'active',
    specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '-', fanSize: '120mm', fanSpeed: '600-1800 RPM', noiseLevel: '25.6 dBA', tdpRating: '180W', rgb: 'ไม่มี', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ฮีทซิงค์ลมราคาประหยัด คุ้มค่าที่สุดในตลาด', updatedAt: '2026-07-19T10:00:00Z',
  },
  {
    id: 'cool-6', displayCode: 'COOL-006', sku: 'CO-AS-LC240', name: 'ASUS ROG Ryujin III 240', brand: 'ASUS',
    sellingPrice: 8990, promoEnabled: false, promoPrice: 0, stock: 0, status: 'out_of_stock',
    specs: { coolingType: 'AIO Liquid 240mm', socketSupport: 'LGA 1700 / AM5', radiatorSize: '240mm', fanSize: '120mm x2', fanSpeed: '450-2000 RPM', noiseLevel: '9-37 dBA', tdpRating: '280W', rgb: 'มี LiveDash OLED', warranty: '6 ปี' },
    extraSpecs: [], videoLinks: [], description: 'พรีเมียม พร้อมจอ OLED และพัดลมเสริมบนปั๊ม', updatedAt: '2026-07-14T10:00:00Z',
  },
  {
    id: 'cool-7', displayCode: 'COOL-007', sku: 'CO-TR-PA120', name: 'Thermalright Peerless Assassin 120', brand: 'THERMALRIGHT',
    sellingPrice: 1090, promoEnabled: true, promoPrice: 890, stock: 18, status: 'active',
    specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '-', fanSize: '120mm x2', fanSpeed: '500-1550 RPM', noiseLevel: '25.6 dBA', tdpRating: '245W', rgb: 'ไม่มี', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'สายคุ้ม ราคาไม่ถึงพัน ประสิทธิภาพเทียบรุ่นแพง', updatedAt: '2026-07-08T10:00:00Z',
  },
  {
    id: 'cool-8', displayCode: 'COOL-008', sku: 'CO-GB-AORUS280', name: 'Gigabyte Aorus Waterforce X 280', brand: 'GIGABYTE',
    sellingPrice: 6490, promoEnabled: false, promoPrice: 0, stock: 6, status: 'preorder',
    specs: { coolingType: 'AIO Liquid 280mm', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '280mm', fanSize: '140mm x2', fanSpeed: '500-1900 RPM', noiseLevel: '10-33 dBA', tdpRating: '270W', rgb: 'มี RGB', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'จอ LCD วงกลมแสดงสถานะ ดีไซน์เกมมิ่ง', updatedAt: '2026-06-30T10:00:00Z',
  },
  {
    id: 'cool-9', displayCode: 'COOL-009', sku: 'CO-DC-LS720', name: 'DeepCool LS720', brand: 'DEEPCOOL',
    sellingPrice: 3990, promoEnabled: false, promoPrice: 0, stock: 8, status: 'active',
    specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700 / AM5 / AM4', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '500-1800 RPM', noiseLevel: '17.5-29.5 dBA', tdpRating: '280W', rgb: 'มี ARGB', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ราคาคุ้มค่า วอเตอร์บล็อคปั๊มคู่ ระบายความร้อนดี', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'cool-10', displayCode: 'COOL-010', sku: 'CO-CS-A71', name: 'Corsair A71 (รุ่นเดิม)', brand: 'CORSAIR',
    sellingPrice: 1290, promoEnabled: false, promoPrice: 0, stock: 4, status: 'discontinued',
    specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700 / AM4', radiatorSize: '-', fanSize: '120mm', fanSpeed: '600-1700 RPM', noiseLevel: '26 dBA', tdpRating: '200W', rgb: 'ไม่มี', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'รุ่นเก่าเลิกผลิต ทดแทนด้วยรุ่นใหม่กว่า', updatedAt: '2026-05-05T10:00:00Z',
  },
]

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Cooling {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getCoolers(): Promise<Cooling[]> {
  if (USE_MOCK_DATA) return mockDelay(mockCoolers)
  return api.get<Cooling[]>('/coolings').then((res) => res.data.map(fromApi))
}

export function getCoolingDetail(id: string): Promise<Cooling | null> {
  if (USE_MOCK_DATA) return mockDelay(mockCoolers.find((c) => c.id === id) ?? null)
  return api
    .get<Cooling>(`/coolings/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveCooling(
  id: string,
  data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/coolings/${id}`, toApiBody(data)).then(() => undefined)
}

export function createCooling(
  data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `cool-${Date.now()}` })
  return api.post<Cooling>('/coolings', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCooling(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/coolings/${id}`).then(() => undefined)
}
