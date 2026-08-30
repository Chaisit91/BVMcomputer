import type { PromoSetCreateFormValues, PromoSetEditFormValues } from '../schemas/promoSet.schema'
import type { PromoSet, PromoSetExtraPart, PromoSetSummary } from '../types/promoSet'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const sets: PromoSet[] = [
  {
    id: '1',
    code: 'AUG26-D4-056',
    name: 'iHAVECPU LEVEL UP DDR4 AUG 2026',
    status: 'selling',
    specSummary: 'i5-14400F + RTX 5070',
    regularPrice: 49500,
    promoPrice: 43990,
    stock: 12,
    components: {
      cpu: 'Intel Core i5-14400F 4.7GHz 10C/16T (TRAY) (3Y)',
      motherboard: 'GIGABYTE B760M D3HP DDR4 (REV1.0) (3Y)',
      gpu: 'ZOTAC GAMING GeForce RTX 5070 TWIN EDGE OC - 12GB GDDR7 (3Y)',
      ram: 'CORSAIR VENGEANCE LPX 16GB (8x2) DDR4 3200MHz BLACK (LT)',
      storage: 'M.2 ADATA LEGEND 860 500GB Read/Write 3600 MB/s (5Y)',
      psu: 'CORSAIR CX750 750W (80+BRONZE) (5Y)',
      case: 'ASUS A21 TEMPERED GLASS (WHITE/ATX) (2Y)',
      cooling: 'iHAVECPU AELCUS MK2 (BLACK) (1Y)',
    },
    extraParts: [
      { id: 'ep1', name: 'เมาส์เกมมิ่ง', value: 'Logitech G102 LIGHTSYNC' },
      { id: 'ep2', name: 'คีย์บอร์ด', value: 'Fantech MK852 RGB' },
    ],
    description:
      'เซ็ตคอมสำหรับเล่นเกม AAA แบบ 1080p-1440p ที่ลื่นไหล ด้วยพลัง Intel Core i5-14400F คู่กับ ZOTAC GAMING GeForce RTX 5070 พร้อม RAM DDR4 16GB และ SSD NVMe 500GB ความเร็วสูง เหมาะสำหรับเกมเมอร์ที่ต้องการประสิทธิภาพคุ้มค่า',
    highlights: ['ประกัน AAA 1080p-1440p', 'ประกันสูงสุด 4ปี', 'ราคาพิเศษ', 'ผ่อนได้ 0%'],
    videoLinks: ['https://youtube.com/watch?v=example123', 'https://youtube.com/watch?v=benchmark456'],
    notes: 'ของแถม iHAVECPU Sticker, ร่มเดินทาง, USB WiFi D-Link N150',
  },
  {
    id: '2',
    code: 'AUG26-D5-012',
    name: 'BVMcomputer STARTER DDR5',
    status: 'selling',
    specSummary: 'i5-14400F + RTX 5060 Ti',
    regularPrice: 35900,
    promoPrice: 31990,
    stock: 8,
    components: {
      cpu: 'Intel Core i5-14400F',
      motherboard: 'MSI PRO B760M-P DDR5',
      gpu: 'RTX 5060 Ti 16GB',
      ram: '16GB DDR5 5600MHz',
      storage: '1TB NVMe SSD',
      psu: '650W 80+ Bronze',
      case: 'Micro ATX Case',
      cooling: 'Stock Cooler',
    },
    extraParts: [],
    description: '',
    highlights: [],
    videoLinks: [],
    notes: '',
  },
  {
    id: '3',
    code: 'AUG26-D5-045',
    name: 'BVMcomputer PRO DDR5',
    status: 'out_of_stock',
    specSummary: 'i7-14700K + RTX 5070 Ti',
    regularPrice: 72500,
    promoPrice: 65900,
    stock: 3,
    components: {
      cpu: 'Intel Core i7-14700K',
      motherboard: 'ASUS ROG STRIX B760-F',
      gpu: 'RTX 5070 Ti 16GB',
      ram: '32GB DDR5 6000MHz',
      storage: '2TB NVMe SSD',
      psu: '850W 80+ Gold',
      case: 'Mid Tower ATX',
      cooling: '240mm AIO',
    },
    extraParts: [],
    description: '',
    highlights: [],
    videoLinks: [],
    notes: '',
  },
  {
    id: '4',
    code: 'AUG26-D5-089',
    name: 'BVMcomputer ULTRA DDR5',
    status: 'closed',
    specSummary: 'i9-14900K + RTX 5090',
    regularPrice: 125000,
    promoPrice: 109900,
    stock: 0,
    components: {
      cpu: 'Intel Core i9-14900K',
      motherboard: 'MSI MEG Z790 ACE',
      gpu: 'RTX 5090 32GB',
      ram: '64GB DDR5 6400MHz',
      storage: '4TB NVMe SSD',
      psu: '1200W 80+ Platinum',
      case: 'Full Tower ATX',
      cooling: '360mm AIO',
    },
    extraParts: [],
    description: '',
    highlights: [],
    videoLinks: [],
    notes: '',
  },
  {
    id: '5',
    code: 'AUG26-AM-023',
    name: 'AMD GAMING SET',
    status: 'selling',
    specSummary: 'Ryzen 7 7800X3D + RX 9070',
    regularPrice: 42000,
    promoPrice: 38500,
    stock: 15,
    components: {
      cpu: 'AMD Ryzen 7 7800X3D',
      motherboard: 'MSI MAG B650 TOMAHAWK',
      gpu: 'RX 9070 16GB',
      ram: '32GB DDR5 6000MHz',
      storage: '1TB NVMe SSD',
      psu: '750W 80+ Gold',
      case: 'Mid Tower ATX',
      cooling: '240mm AIO',
    },
    extraParts: [],
    description: '',
    highlights: [],
    videoLinks: [],
    notes: '',
  },
  {
    id: '6',
    code: 'AUG26-OF-007',
    name: 'BUDGET OFFICE SET',
    status: 'selling',
    specSummary: 'Ryzen 5 7600 + Integrated',
    regularPrice: 18900,
    promoPrice: 15990,
    stock: 5,
    components: {
      cpu: 'AMD Ryzen 5 7600',
      motherboard: 'ASRock B650M-HDV',
      gpu: 'Integrated Graphics',
      ram: '16GB DDR5 5200MHz',
      storage: '500GB NVMe SSD',
      psu: '450W 80+ Bronze',
      case: 'Micro ATX Case',
      cooling: 'Stock Cooler',
    },
    extraParts: [],
    description: '',
    highlights: [],
    videoLinks: [],
    notes: '',
  },
]

export function getPromoSetSummary(): Promise<PromoSetSummary> {
  return mockDelay({ total: 24, selling: 18, outOfStock: 3, closed: 3 })
}

export function getPromoSets(): Promise<PromoSet[]> {
  return mockDelay(sets)
}

export function getPromoSetDetail(id: string): Promise<PromoSet | null> {
  return mockDelay(sets.find((set) => set.id === id) ?? null)
}

export function savePromoSet(
  _id: string,
  _data: PromoSetEditFormValues & { highlights: string[]; videoLinks: string[]; extraParts: PromoSetExtraPart[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createPromoSet(
  _data: PromoSetCreateFormValues & { videoLinks: string[]; extraParts: PromoSetExtraPart[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(sets.length + 1) })
}

export function deletePromoSet(_id: string): Promise<void> {
  return mockDelay(undefined)
}
