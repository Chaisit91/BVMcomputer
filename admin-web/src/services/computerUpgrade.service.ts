import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { ComputerUpgradeFormValues } from '../schemas/computerUpgrade.schema'
import type { ComponentSlot } from '../types/componentSlots'
import type { ComputerUpgrade, ComputerUpgradeItem } from '../types/computerUpgrade'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Backend Decimal fields (`items[].newProductPrice`) serialize as strings —
// coerce to numbers here so arithmetic/sorting/toLocaleString work.
function fromApi(raw: any): ComputerUpgrade {
  return {
    ...raw,
    items: (raw.items ?? []).map((item: any) => ({
      ...item,
      newProductPrice: item.newProductPrice == null ? null : Number(item.newProductPrice),
    })),
  }
}

// Customers must describe their whole machine (see
// Backend-web/src/schemas/computerUpgradePublic.schema.ts — 8 slots
// required), so every mock record below has all 8 filled in too: some
// slots are just "what they have" (mockOldItem), others are also flagged
// for upgrade (mockUpgradedItem), matching what a real submission looks like.
function mockOldItem(idx: number, slot: ComponentSlot, oldItemDescription: string): ComputerUpgradeItem {
  return {
    id: `mock-item-${idx}`,
    slot,
    oldItemDescription,
    oldItemPhotoUrl: null,
    customerWantsUpgrade: false,
    newProductId: null,
    newProductName: null,
    newProductSku: null,
    newProductPrice: null,
    aiRecommendation: null,
    verifiedByAdmin: false,
    verifiedAt: null,
    verifiedByName: null,
  }
}

function mockUpgradedItem(
  idx: number,
  slot: ComponentSlot,
  oldItemDescription: string,
  newProductName: string,
  newProductPrice: number,
  verified: boolean,
): ComputerUpgradeItem {
  return {
    id: `mock-item-${idx}`,
    slot,
    oldItemDescription,
    oldItemPhotoUrl: null,
    customerWantsUpgrade: true,
    newProductId: `mock-${slot}-${idx}`,
    newProductName,
    newProductSku: `SKU-${slot.toUpperCase()}-${idx}`,
    newProductPrice,
    aiRecommendation: verified ? null : `แนะนำให้อัปเกรดเป็น ${newProductName} เพื่อประสิทธิภาพที่ดีขึ้น`,
    verifiedByAdmin: verified,
    verifiedAt: verified ? '2026-09-10T09:00:00.000Z' : null,
    verifiedByName: verified ? 'แอดมิน สมหญิง' : null,
  }
}

const MOCK_COMPUTER_UPGRADES: ComputerUpgrade[] = [
  {
    id: 'mock-upg-1',
    customerId: null,
    customerNameSnapshot: 'อนุชา แก้วมณี',
    customerName: 'อนุชา แก้วมณี',
    status: 'pending_review',
    notes: 'ลูกค้าต้องการอัปเกรดการ์ดจอและแรม',
    createdAt: '2026-09-12T09:00:00.000Z',
    updatedAt: '2026-09-12T09:00:00.000Z',
    items: [
      mockOldItem(101, 'cpu', 'Intel Core i5-9400F'),
      mockUpgradedItem(1, 'gpu', 'การ์ดจอเดิม GTX 1660', 'RTX 4060 8GB', 12900, false),
      mockOldItem(102, 'motherboard', 'ASUS PRIME H310M-E'),
      mockUpgradedItem(2, 'ram', 'แรมเดิม DDR4 8GB (1x8)', 'DDR4 16GB (8x2) 3200MHz', 1490, false),
      mockOldItem(103, 'storage', 'HDD 1TB 7200RPM'),
      mockOldItem(104, 'case', 'Mid Tower ATX ธรรมดา'),
      mockOldItem(105, 'psu', 'Corsair CV550 550W'),
      mockOldItem(106, 'cooling', 'พัดลม CPU ของแท้ติดเครื่อง'),
    ],
  },
  {
    id: 'mock-upg-2',
    customerId: null,
    customerNameSnapshot: 'พิมพ์ชนก รัตนโชติ',
    customerName: 'พิมพ์ชนก รัตนโชติ',
    status: 'in_progress',
    notes: 'อัปเกรด SSD และ PSU ให้รองรับการ์ดจอใหม่',
    createdAt: '2026-09-10T13:00:00.000Z',
    updatedAt: '2026-09-11T10:00:00.000Z',
    items: [
      mockOldItem(107, 'cpu', 'AMD Ryzen 5 3600'),
      mockOldItem(108, 'gpu', 'GTX 1070'),
      mockOldItem(109, 'motherboard', 'MSI B450M PRO-VDH'),
      mockOldItem(110, 'ram', 'DDR4 16GB (2x8) 3200MHz'),
      mockUpgradedItem(3, 'storage', 'ฮาร์ดดิสก์เดิม HDD 500GB', 'NVMe SSD 1TB Gen4', 2490, true),
      mockOldItem(111, 'case', 'Mid Tower มีช่องลมพอสมควร'),
      mockUpgradedItem(4, 'psu', 'พาวเวอร์ซัพพลายเดิม 450W', '650W 80+ Bronze', 1590, false),
      mockOldItem(112, 'cooling', 'Stock Cooler AMD Wraith'),
    ],
  },
  {
    id: 'mock-upg-3',
    customerId: null,
    customerNameSnapshot: 'ธีรวัฒน์ ศักดิ์สิทธิ์',
    customerName: 'ธีรวัฒน์ ศักดิ์สิทธิ์',
    status: 'completed',
    notes: 'อัปเกรดครบทุกชิ้นตามที่ลูกค้าต้องการ',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-03T15:00:00.000Z',
    items: [
      mockUpgradedItem(5, 'cpu', 'ซีพียูเดิม i5-10400', 'Intel Core i5-14400F', 6900, true),
      mockOldItem(113, 'gpu', 'GTX 1650'),
      mockUpgradedItem(6, 'motherboard', 'เมนบอร์ดเดิม H410M', 'ASUS PRIME B760M-A', 3900, true),
      mockOldItem(114, 'ram', 'DDR4 8GB (1x8) 2666MHz'),
      mockOldItem(115, 'storage', 'SSD SATA 256GB'),
      mockOldItem(116, 'case', 'Mini Tower'),
      mockOldItem(117, 'psu', '500W 80+ White'),
      mockUpgradedItem(7, 'cooling', 'ฮีตซิงก์เดิมของแท้', 'Air Cooler Tower 4 Heatpipe', 690, true),
    ],
  },
  {
    id: 'mock-upg-4',
    customerId: null,
    customerNameSnapshot: 'ศิริพร มงคลชัย',
    customerName: 'ศิริพร มงคลชัย',
    status: 'cancelled',
    notes: 'ลูกค้ายกเลิกคำขออัปเกรด',
    createdAt: '2026-08-28T11:00:00.000Z',
    updatedAt: '2026-08-29T09:00:00.000Z',
    items: [
      mockOldItem(118, 'cpu', 'AMD Ryzen 3 3200G'),
      mockOldItem(119, 'gpu', 'การ์ดจอในตัว Vega 8'),
      mockOldItem(120, 'motherboard', 'A320M'),
      mockOldItem(121, 'ram', 'DDR4 8GB (1x8) 2400MHz'),
      mockOldItem(122, 'storage', 'HDD 500GB'),
      mockUpgradedItem(8, 'case', 'เคสเดิมช่องลมน้อย', 'Mid Tower ATX RGB', 1590, false),
      mockOldItem(123, 'psu', '400W ไม่มียี่ห้อ'),
      mockOldItem(124, 'cooling', 'Stock Cooler AMD'),
    ],
  },
  {
    id: 'mock-upg-5',
    customerId: null,
    customerNameSnapshot: 'ณัฐพล เจริญสุข',
    customerName: 'ณัฐพล เจริญสุข',
    status: 'pending_review',
    notes: '',
    createdAt: '2026-09-13T14:00:00.000Z',
    updatedAt: '2026-09-13T14:00:00.000Z',
    items: [
      mockOldItem(125, 'cpu', 'Intel Core i7-9700'),
      mockUpgradedItem(9, 'gpu', 'การ์ดจอเดิม GTX 1050 Ti', 'RTX 4070 12GB', 18900, false),
      mockOldItem(126, 'motherboard', 'Z390-A PRO'),
      mockOldItem(127, 'ram', 'DDR4 16GB (2x8) 3000MHz'),
      mockOldItem(128, 'storage', 'NVMe SSD 500GB Gen3'),
      mockOldItem(129, 'case', 'Full Tower ATX'),
      mockUpgradedItem(10, 'psu', 'พาวเวอร์ซัพพลายเดิม 500W', '750W 80+ Gold', 2490, false),
      mockUpgradedItem(11, 'cooling', 'ฮีตซิงก์เดิมพัดลมเสียงดัง', 'AIO Liquid Cooler 240mm', 2900, true),
    ],
  },
]

export function getComputerUpgrades(): Promise<ComputerUpgrade[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_COMPUTER_UPGRADES)
  return api.get<any[]>('/computer-upgrades').then((res) => res.data.map(fromApi))
}

export function getComputerUpgradeDetail(id: string): Promise<ComputerUpgrade | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_COMPUTER_UPGRADES.find((item) => item.id === id) ?? null)
  return api
    .get<any>(`/computer-upgrades/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

function toApiBody(data: ComputerUpgradeFormValues) {
  const { customer, ...rest } = data
  return { ...rest, customerNameSnapshot: customer }
}

export function saveComputerUpgrade(id: string, data: ComputerUpgradeFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/computer-upgrades/${id}`, toApiBody(data)).then(() => undefined)
}

export function createComputerUpgrade(data: ComputerUpgradeFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-upg-${Date.now()}` })
  return api.post<{ id: string }>('/computer-upgrades', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteComputerUpgrade(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/computer-upgrades/${id}`).then(() => undefined)
}

export function uploadOldItemPhoto(id: string, slot: ComponentSlot, file: File): Promise<ComputerUpgrade> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_COMPUTER_UPGRADES.find((item) => item.id === id) ?? MOCK_COMPUTER_UPGRADES[0]
    return mockDelay({
      ...existing,
      items: existing.items.map((item) =>
        item.slot === slot ? { ...item, oldItemPhotoUrl: URL.createObjectURL(file) } : item,
      ),
    })
  }
  const formData = new FormData()
  formData.append('photo', file)
  return api.post<any>(`/computer-upgrades/${id}/items/${slot}/photo`, formData).then((res) => fromApi(res.data))
}

export function verifyOldItem(id: string, slot: ComponentSlot): Promise<ComputerUpgrade> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_COMPUTER_UPGRADES.find((item) => item.id === id) ?? MOCK_COMPUTER_UPGRADES[0]
    return mockDelay({
      ...existing,
      items: existing.items.map((item) =>
        item.slot === slot
          ? { ...item, verifiedByAdmin: true, verifiedAt: new Date().toISOString(), verifiedByName: 'แอดมิน (พรีวิว)' }
          : item,
      ),
    })
  }
  return api.post<any>(`/computer-upgrades/${id}/items/${slot}/verify`).then((res) => fromApi(res.data))
}
