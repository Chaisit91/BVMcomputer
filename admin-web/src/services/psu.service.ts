import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { PsuFormValues } from '../schemas/psu.schema'
import type { ExtraSpec, Psu } from '../types/psu'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockPsus: Psu[] = [
  {
    id: 'psu-1', displayCode: 'PSU-001', sku: 'PS-CS-RM750', name: 'Corsair RM750e', brand: 'CORSAIR',
    sellingPrice: 3690, promoEnabled: true, promoPrice: 3290, stock: 20, status: 'active',
    specs: { continuousPower: '750 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '1x 24-pin, 2x EPS, 4x PCIe', protection: 'OVP/UVP/OCP/OTP', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'พาวเวอร์รุ่นยอดนิยม เงียบ เสถียร คุ้มราคา', updatedAt: '2026-08-14T10:00:00Z',
  },
  {
    id: 'psu-2', displayCode: 'PSU-002', sku: 'PS-SS-FOCUS650', name: 'Seasonic Focus GX-650', brand: 'ASUS',
    sellingPrice: 3290, promoEnabled: false, promoPrice: 0, stock: 15, status: 'active',
    specs: { continuousPower: '650 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '1x 24-pin, 1x EPS, 2x PCIe', protection: 'OVP/UVP/OCP/OTP/SCP', warranty: '10 ปี' },
    extraSpecs: [], videoLinks: [], description: 'รับประกันยาว 10 ปี เหมาะกับเครื่องใช้งานทั่วไป', updatedAt: '2026-08-11T10:00:00Z',
  },
  {
    id: 'psu-3', displayCode: 'PSU-003', sku: 'PS-CM-MWE850', name: 'Cooler Master MWE Gold 850 V2', brand: 'COOLER MASTER',
    sellingPrice: 3990, promoEnabled: false, promoPrice: 0, stock: 6, status: 'active',
    specs: { continuousPower: '850 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '1x 24-pin, 2x EPS, 4x PCIe', protection: 'OVP/UVP/OCP/OTP/SCP', warranty: '5 ปี' },
    extraSpecs: [], videoLinks: [], description: 'กำลังไฟสูง รองรับการ์ดจอระดับไฮเอนด์', updatedAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'psu-4', displayCode: 'PSU-004', sku: 'PS-FSP-HYDRO600', name: 'FSP Hydro K2 600', brand: 'FSP',
    sellingPrice: 1690, promoEnabled: true, promoPrice: 1490, stock: 2, status: 'low_stock',
    specs: { continuousPower: '600 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '1x 24-pin, 1x EPS, 2x PCIe', protection: 'OVP/UVP/OCP', warranty: '3 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ราคาประหยัด เหมาะกับเครื่องออฟฟิศ', updatedAt: '2026-07-30T10:00:00Z',
  },
  {
    id: 'psu-5', displayCode: 'PSU-005', sku: 'PS-GB-UD1000', name: 'Gigabyte UD1000GM PG5', brand: 'GIGABYTE',
    sellingPrice: 5990, promoEnabled: false, promoPrice: 0, stock: 4, status: 'preorder',
    specs: { continuousPower: '1000 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '1x 24-pin, 2x EPS, 1x 12VHPWR', protection: 'OVP/UVP/OCP/OTP/SCP', warranty: '10 ปี' },
    extraSpecs: [], videoLinks: [], description: 'รองรับขั้ว 12VHPWR โดยตรง สำหรับการ์ดจอรุ่นใหม่', updatedAt: '2026-07-22T10:00:00Z',
  },
  {
    id: 'psu-6', displayCode: 'PSU-006', sku: 'PS-MS-MAG750', name: 'MSI MAG A750BN', brand: 'MSI',
    sellingPrice: 2490, promoEnabled: false, promoPrice: 0, stock: 0, status: 'out_of_stock',
    specs: { continuousPower: '750 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '1x 24-pin, 2x EPS, 2x PCIe', protection: 'OVP/UVP/OCP/OTP', warranty: '3 ปี' },
    extraSpecs: [], videoLinks: [], description: 'กำลังไฟเหลือเฟือ ราคาจับต้องได้', updatedAt: '2026-07-18T10:00:00Z',
  },
  {
    id: 'psu-7', displayCode: 'PSU-007', sku: 'PS-TT-TOUGH850', name: 'Thermaltake Toughpower GF3 850', brand: 'THERMALTAKE',
    sellingPrice: 4590, promoEnabled: true, promoPrice: 3990, stock: 9, status: 'active',
    specs: { continuousPower: '850 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '140mm', connectors: '1x 24-pin, 2x EPS, 1x 12VHPWR', protection: 'OVP/UVP/OCP/OTP/SCP', warranty: '10 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ดีไซน์พัดลม RGB สวยงาม ประสิทธิภาพสูง', updatedAt: '2026-07-05T10:00:00Z',
  },
  {
    id: 'psu-8', displayCode: 'PSU-008', sku: 'PS-AC-LUX550', name: 'Aerocool Lux 550', brand: 'AEROCOOL',
    sellingPrice: 990, promoEnabled: false, promoPrice: 0, stock: 30, status: 'active',
    specs: { continuousPower: '550 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '1x 24-pin, 1x EPS, 2x PCIe', protection: 'OVP/UVP/OCP', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'พาวเวอร์เริ่มต้น เหมาะกับเครื่องประกอบทั่วไป', updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'psu-9', displayCode: 'PSU-009', sku: 'PS-CS-HX1200', name: 'Corsair HX1200i', brand: 'CORSAIR',
    sellingPrice: 8990, promoEnabled: false, promoPrice: 0, stock: 3, status: 'active',
    specs: { continuousPower: '1200 Watt', certification: '80+ Platinum', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '140mm', connectors: '1x 24-pin, 2x EPS, 1x 12VHPWR', protection: 'OVP/UVP/OCP/OTP/SCP', warranty: '10 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ระดับ Platinum รองรับระบบสเปคสูงสุด มี digital monitoring', updatedAt: '2026-06-11T10:00:00Z',
  },
  {
    id: 'psu-10', displayCode: 'PSU-010', sku: 'PS-MS-A650', name: 'MSI MAG A650BN (รุ่นเดิม)', brand: 'MSI',
    sellingPrice: 1990, promoEnabled: false, promoPrice: 0, stock: 7, status: 'discontinued',
    specs: { continuousPower: '650 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '1x 24-pin, 1x EPS, 2x PCIe', protection: 'OVP/UVP/OCP', warranty: '3 ปี' },
    extraSpecs: [], videoLinks: [], description: 'รุ่นเก่าเลิกผลิต แทนที่ด้วยรุ่น A750BN', updatedAt: '2026-05-02T10:00:00Z',
  },
]

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Psu {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getPsus(): Promise<Psu[]> {
  if (USE_MOCK_DATA) return mockDelay(mockPsus)
  return api.get<Psu[]>('/psus').then((res) => res.data.map(fromApi))
}

export function getPsuDetail(id: string): Promise<Psu | null> {
  if (USE_MOCK_DATA) return mockDelay(mockPsus.find((p) => p.id === id) ?? null)
  return api
    .get<Psu>(`/psus/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function savePsu(
  id: string,
  data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/psus/${id}`, toApiBody(data)).then(() => undefined)
}

export function createPsu(
  data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `psu-${Date.now()}` })
  return api.post<Psu>('/psus', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deletePsu(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/psus/${id}`).then(() => undefined)
}
