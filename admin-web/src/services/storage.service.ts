import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { StorageFormValues } from '../schemas/storage.schema'
import type { ExtraSpec, Storage } from '../types/storage'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Sample catalog for previewing the UI while the real Supabase catalog is
// still empty — matches the current Storage shape exactly. Remove/ignore once
// USE_MOCK_DATA is flipped back to false in lib/mockMode.ts.
const mockStorages: Storage[] = [
  {
    id: 'mock-storage-1',
    sku: 'STG-SAM-980P1TB',
    name: 'Samsung 980 PRO 1TB NVMe SSD',
    brand: 'Samsung',
    sellingPrice: 2990,
    promoEnabled: false,
    promoPrice: 0,
    stock: 35,
    status: 'active',
    specs: {
      type: 'SSD NVMe',
      capacity: '1TB',
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      sequentialRead: '7000 MB/s',
      sequentialWrite: '5000 MB/s',
      cacheMemory: '1GB LPDDR4',
      mtbf: '1,500,000 ชั่วโมง',
      warranty: '5 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'SSD ความเร็วสูงสำหรับเกมมิ่งและงานที่ต้องการความเร็วในการโหลดไฟล์',
    updatedAt: '2026-06-08T10:00:00.000Z',
  },
  {
    id: 'mock-storage-2',
    sku: 'STG-WD-BLK2TB',
    name: 'WD Black SN850X 2TB NVMe SSD',
    brand: 'Western Digital',
    sellingPrice: 5490,
    promoEnabled: true,
    promoPrice: 4990,
    stock: 20,
    status: 'active',
    specs: {
      type: 'SSD NVMe',
      capacity: '2TB',
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      sequentialRead: '7300 MB/s',
      sequentialWrite: '6600 MB/s',
      cacheMemory: '2GB DDR4',
      mtbf: '1,800,000 ชั่วโมง',
      warranty: '5 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'เหมาะสำหรับเกมเมอร์และครีเอเตอร์ที่ต้องการพื้นที่เก็บข้อมูลมาก',
    updatedAt: '2026-05-30T10:00:00.000Z',
  },
  {
    id: 'mock-storage-3',
    sku: 'STG-KIN-A400-480',
    name: 'Kingston A400 480GB SATA SSD',
    brand: 'Kingston',
    sellingPrice: 990,
    promoEnabled: false,
    promoPrice: 0,
    stock: 60,
    status: 'active',
    specs: {
      type: 'SSD SATA',
      capacity: '480GB',
      interface: 'SATA III 6Gb/s',
      formFactor: '2.5"',
      sequentialRead: '500 MB/s',
      sequentialWrite: '450 MB/s',
      cacheMemory: 'ไม่มี',
      mtbf: '1,000,000 ชั่วโมง',
      warranty: '3 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'อัปเกรดจากฮาร์ดดิสก์เดิมได้ง่าย ราคาประหยัด เหมาะกับคอมทั่วไป',
    updatedAt: '2026-04-11T10:00:00.000Z',
  },
  {
    id: 'mock-storage-4',
    sku: 'STG-SEA-BARR4TB',
    name: 'Seagate BarraCuda 4TB HDD',
    brand: 'Seagate',
    sellingPrice: 3290,
    promoEnabled: false,
    promoPrice: 0,
    stock: 6,
    status: 'low_stock',
    specs: {
      type: 'HDD',
      capacity: '4TB',
      interface: 'SATA III 6Gb/s',
      formFactor: '3.5"',
      sequentialRead: '190 MB/s',
      sequentialWrite: '190 MB/s',
      cacheMemory: '256MB',
      mtbf: '600,000 ชั่วโมง',
      warranty: '2 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ฮาร์ดดิสก์ความจุสูงสำหรับเก็บข้อมูลและไฟล์มีเดียจำนวนมาก',
    updatedAt: '2026-03-02T10:00:00.000Z',
  },
  {
    id: 'mock-storage-5',
    sku: 'STG-CRU-P3P2TB',
    name: 'Crucial P3 Plus 2TB NVMe SSD',
    brand: 'Crucial',
    sellingPrice: 4290,
    promoEnabled: true,
    promoPrice: 3790,
    stock: 0,
    status: 'out_of_stock',
    specs: {
      type: 'SSD NVMe',
      capacity: '2TB',
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      sequentialRead: '5000 MB/s',
      sequentialWrite: '4200 MB/s',
      cacheMemory: 'ไม่มี (HMB)',
      mtbf: '1,500,000 ชั่วโมง',
      warranty: '5 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ความจุสูงในราคาคุ้มค่า เหมาะสำหรับเก็บเกมและไฟล์งาน',
    updatedAt: '2026-02-25T10:00:00.000Z',
  },
  {
    id: 'mock-storage-6',
    sku: 'STG-WD-BLU1TB',
    name: 'WD Blue 1TB SATA SSD',
    brand: 'Western Digital',
    sellingPrice: 1890,
    promoEnabled: false,
    promoPrice: 0,
    stock: 28,
    status: 'active',
    specs: {
      type: 'SSD SATA',
      capacity: '1TB',
      interface: 'SATA III 6Gb/s',
      formFactor: '2.5"',
      sequentialRead: '560 MB/s',
      sequentialWrite: '530 MB/s',
      cacheMemory: '1GB DDR3',
      mtbf: '1,750,000 ชั่วโมง',
      warranty: '5 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ความน่าเชื่อถือสูง เหมาะสำหรับใช้งานทั่วไปในระยะยาว',
    updatedAt: '2026-01-19T10:00:00.000Z',
  },
  {
    id: 'mock-storage-7',
    sku: 'STG-SAM-990PRO4TB',
    name: 'Samsung 990 PRO 4TB NVMe SSD',
    brand: 'Samsung',
    sellingPrice: 12900,
    promoEnabled: false,
    promoPrice: 0,
    stock: 9,
    status: 'preorder',
    specs: {
      type: 'SSD NVMe',
      capacity: '4TB',
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      sequentialRead: '7450 MB/s',
      sequentialWrite: '6900 MB/s',
      cacheMemory: '4GB LPDDR4',
      mtbf: '1,500,000 ชั่วโมง',
      warranty: '5 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ความจุสูงสุดในซีรีส์ เหมาะสำหรับสตูดิโอตัดต่อวิดีโอระดับมืออาชีพ',
    updatedAt: '2026-06-14T10:00:00.000Z',
  },
  {
    id: 'mock-storage-8',
    sku: 'STG-TOSH-P300-1TB',
    name: 'Toshiba P300 1TB HDD',
    brand: 'Toshiba',
    sellingPrice: 1290,
    promoEnabled: false,
    promoPrice: 0,
    stock: 1,
    status: 'discontinued',
    specs: {
      type: 'HDD',
      capacity: '1TB',
      interface: 'SATA III 6Gb/s',
      formFactor: '3.5"',
      sequentialRead: '150 MB/s',
      sequentialWrite: '150 MB/s',
      cacheMemory: '64MB',
      mtbf: '500,000 ชั่วโมง',
      warranty: '2 ปี',
    },
    extraSpecs: [],
    videoLinks: [],
    description: 'ฮาร์ดดิสก์รุ่นเก่าสำหรับงานทั่วไป (เลิกจำหน่าย เหลือสต็อกสุดท้าย)',
    updatedAt: '2025-10-05T10:00:00.000Z',
  },
]

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Storage {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getStorages(): Promise<Storage[]> {
  if (USE_MOCK_DATA) return mockDelay(mockStorages)
  return api.get<Storage[]>('/storages').then((res) => res.data.map(fromApi))
}

export function getStorageDetail(id: string): Promise<Storage | null> {
  if (USE_MOCK_DATA) return mockDelay(mockStorages.find((storage) => storage.id === id) ?? null)
  return api
    .get<Storage>(`/storages/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveStorage(
  id: string,
  data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/storages/${id}`, toApiBody(data)).then(() => undefined)
}

export function createStorage(
  data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-storage-${Date.now()}` })
  return api.post<Storage>('/storages', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteStorage(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/storages/${id}`).then(() => undefined)
}
