import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { DesktopPcFormValues } from '../schemas/desktopPc.schema'
import type { DesktopPc } from '../types/desktopPc'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Backend returns Product's real field name `sellingPrice` — the rest of the
// admin-web UI calls it `price`, so translate at the service boundary only.
function fromApi(raw: any): DesktopPc {
  return { ...raw, price: Number(raw.sellingPrice) }
}

const MOCK_DESKTOP_PCS: DesktopPc[] = [
  {
    id: 'mock-dpc-1',
    sku: 'DPC-G8-001',
    name: 'Gaming Desktop G8',
    category: 'desktop',
    status: 'active',
    specSummary: 'Intel Core i7-14700K / RTX 4070 Ti SUPER / 32GB DDR5',
    price: 52900,
    stock: 12,
    description: 'ชุดเดสก์ท็อปเกมมิ่งสำหรับเล่นเกม AAA ที่ความละเอียด 1440p-4K',
    highlights: ['การ์ดจอ RTX 4070 Ti SUPER 16GB', 'RAM DDR5 32GB', 'SSD NVMe Gen4 1TB'],
    specs: {
      cpu: 'Intel Core i7-14700K',
      gpu: 'RTX 4070 Ti SUPER 16GB',
      mainboard: 'ASUS ROG STRIX Z790-E',
      ram: 'DDR5 32GB (16x2) 6000MHz',
      storage: 'NVMe SSD 1TB Gen4',
      psu: '850W 80+ Gold',
      case: 'Lian Li O11 Dynamic',
      cooling: 'AIO Liquid Cooler 240mm',
      os: 'Windows 11 Home',
      warranty: 'รับประกัน 3 ปี',
    },
    componentIds: {
      cpu: 'mock-cpu-1', gpu: 'mock-gpu-1', motherboard: 'mock-mb-1', ram: 'mock-ram-1',
      storage: 'mock-storage-1', psu: 'mock-psu-1', case: 'mock-case-1', cooling: 'mock-cooling-1',
    },
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'mock-dpc-2',
    sku: 'DPC-MINI-002',
    name: 'Mini PC Compact S1',
    category: 'mini_pc',
    status: 'active',
    specSummary: 'Intel Core i5-14400 / Intel UHD 730 / 16GB DDR5',
    price: 18900,
    stock: 25,
    description: 'พีซีขนาดเล็กเหมาะสำหรับงานออฟฟิศและใช้งานทั่วไป',
    highlights: ['ขนาดกะทัดรัด', 'ประหยัดไฟ', 'เงียบ'],
    specs: {
      cpu: 'Intel Core i5-14400',
      gpu: 'Intel UHD Graphics 730',
      mainboard: 'ITX B760M',
      ram: 'DDR5 16GB (8x2) 5200MHz',
      storage: 'NVMe SSD 512GB Gen4',
      psu: 'SFX 400W 80+ Bronze',
      case: 'Mini ITX Case',
      cooling: 'Stock Air Cooler',
      os: 'Windows 11 Pro',
      warranty: 'รับประกัน 2 ปี',
    },
    componentIds: {
      cpu: 'mock-cpu-2', gpu: 'mock-gpu-2', motherboard: 'mock-mb-2', ram: 'mock-ram-2',
      storage: 'mock-storage-2', psu: 'mock-psu-2', case: 'mock-case-2', cooling: 'mock-cooling-2',
    },
    updatedAt: '2026-08-28T09:30:00.000Z',
  },
  {
    id: 'mock-dpc-3',
    sku: 'DPC-AIO-003',
    name: 'All-in-One Studio A24',
    category: 'all_in_one',
    status: 'low_stock',
    specSummary: 'Intel Core i5-13400 / Intel Iris Xe / 16GB DDR4 / จอ 23.8"',
    price: 24900,
    stock: 3,
    description: 'ออลอินวันจอ 23.8 นิ้ว เหมาะสำหรับงานเอกสารและมัลติมีเดีย',
    highlights: ['จอ IPS 23.8 นิ้ว', 'ลำโพงในตัว', 'กล้องเว็บแคมในตัว'],
    specs: {
      cpu: 'Intel Core i5-13400',
      gpu: 'Intel Iris Xe Graphics',
      mainboard: 'OEM AIO Board',
      ram: 'DDR4 16GB (8x2) 3200MHz',
      storage: 'SATA SSD 512GB',
      psu: 'Internal 150W',
      case: 'All-in-One Chassis 23.8"',
      cooling: 'Stock Air Cooler',
      os: 'Windows 11 Home',
      warranty: 'รับประกัน 2 ปี',
    },
    componentIds: {
      cpu: 'mock-cpu-3', gpu: 'mock-gpu-3', motherboard: 'mock-mb-3', ram: 'mock-ram-3',
      storage: 'mock-storage-3', psu: 'mock-psu-3', case: 'mock-case-3', cooling: 'mock-cooling-3',
    },
    updatedAt: '2026-08-20T14:15:00.000Z',
  },
  {
    id: 'mock-dpc-4',
    sku: 'DPC-AIWS-004',
    name: 'AI Workstation Pro X2',
    category: 'ai_workstation',
    status: 'active',
    specSummary: 'AMD Ryzen 9 7950X / RTX 4090 24GB / 64GB DDR5',
    price: 129900,
    stock: 5,
    description: 'เวิร์คสเตชันสำหรับงาน AI/Machine Learning และ Rendering ระดับมืออาชีพ',
    highlights: ['RTX 4090 24GB สำหรับ AI Training', 'RAM 64GB', 'SSD NVMe 2TB Gen4'],
    specs: {
      cpu: 'AMD Ryzen 9 7950X',
      gpu: 'RTX 4090 24GB',
      mainboard: 'ASUS ProArt X670E-CREATOR',
      ram: 'DDR5 64GB (32x2) 6000MHz',
      storage: 'NVMe SSD 2TB Gen4',
      psu: '1200W 80+ Platinum',
      case: 'Fractal Design Define 7 XL',
      cooling: 'AIO Liquid Cooler 360mm',
      os: 'Windows 11 Pro',
      warranty: 'รับประกัน 3 ปี',
    },
    componentIds: {
      cpu: 'mock-cpu-4', gpu: 'mock-gpu-4', motherboard: 'mock-mb-4', ram: 'mock-ram-4',
      storage: 'mock-storage-4', psu: 'mock-psu-4', case: 'mock-case-4', cooling: 'mock-cooling-4',
    },
    updatedAt: '2026-09-05T11:45:00.000Z',
  },
  {
    id: 'mock-dpc-5',
    sku: 'DPC-AIENT-005',
    name: 'AI Enterprise Server Rack E1',
    category: 'ai_enterprise',
    status: 'preorder',
    specSummary: 'Dual Xeon Silver 4410Y / 2x RTX 6000 Ada / 256GB DDR5 ECC',
    price: 589000,
    stock: 0,
    description: 'เซิร์ฟเวอร์ AI ระดับองค์กรสำหรับงาน Deep Learning ขนาดใหญ่ สั่งจองล่วงหน้า',
    highlights: ['Dual GPU RTX 6000 Ada', 'RAM ECC 256GB', 'รองรับ Multi-GPU Training'],
    specs: {
      cpu: 'Dual Intel Xeon Silver 4410Y',
      gpu: '2x RTX 6000 Ada Generation 48GB',
      mainboard: 'Supermicro Dual Socket Server Board',
      ram: 'DDR5 ECC 256GB (32x8) 4800MHz',
      storage: 'NVMe SSD RAID 4TB',
      psu: 'Redundant 2000W 80+ Titanium',
      case: 'Rackmount 4U Server Chassis',
      cooling: 'Server-grade Fan Array',
      os: 'Ubuntu Server 24.04 LTS',
      warranty: 'รับประกัน 5 ปี (On-site)',
    },
    componentIds: {
      cpu: 'mock-cpu-5', gpu: 'mock-gpu-5', motherboard: 'mock-mb-5', ram: 'mock-ram-5',
      storage: 'mock-storage-5', psu: 'mock-psu-5', case: 'mock-case-5', cooling: 'mock-cooling-5',
    },
    updatedAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'mock-dpc-6',
    sku: 'DPC-G7-006',
    name: 'Gaming Desktop G7 Lite',
    category: 'desktop',
    status: 'discontinued',
    specSummary: 'AMD Ryzen 5 5600 / RTX 3060 12GB / 16GB DDR4',
    price: 27900,
    stock: 0,
    description: 'รุ่นเก่าที่เลิกจำหน่ายแล้ว คงไว้เพื่อการอ้างอิงประวัติการขาย',
    highlights: ['คุ้มค่าสำหรับเกมมิ่งระดับกลาง'],
    specs: {
      cpu: 'AMD Ryzen 5 5600',
      gpu: 'RTX 3060 12GB',
      mainboard: 'B550M',
      ram: 'DDR4 16GB (8x2) 3200MHz',
      storage: 'NVMe SSD 500GB Gen3',
      psu: '600W 80+ Bronze',
      case: 'Mid Tower ATX',
      cooling: 'Stock Air Cooler',
      os: 'Windows 11 Home',
      warranty: 'รับประกัน 2 ปี',
    },
    componentIds: {
      cpu: 'mock-cpu-6', gpu: 'mock-gpu-6', motherboard: 'mock-mb-6', ram: 'mock-ram-6',
      storage: 'mock-storage-6', psu: 'mock-psu-6', case: 'mock-case-6', cooling: 'mock-cooling-6',
    },
    updatedAt: '2026-06-15T16:20:00.000Z',
  },
]

export function getDesktopPcs(): Promise<DesktopPc[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_DESKTOP_PCS)
  return api.get<any[]>('/desktop-pcs').then((res) => res.data.map(fromApi))
}

export function getDesktopPcDetail(id: string): Promise<DesktopPc | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_DESKTOP_PCS.find((item) => item.id === id) ?? null)
  return api
    .get<any>(`/desktop-pcs/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

function toApiBody(data: DesktopPcFormValues & { highlights: string[] }) {
  const { price, components, os, warranty, status, ...rest } = data
  // low_stock/out_of_stock are derived server-side from stock count, never a
  // real stored value — sending them back would try to write an invalid
  // ProductStatus. Omit `status` entirely so the stored value (active/etc)
  // is left untouched; the backend re-derives the display status on read.
  const isDerivedStatus = status === 'low_stock' || status === 'out_of_stock'
  return { ...rest, sellingPrice: price, os, warranty, components, ...(isDerivedStatus ? {} : { status }) }
}

export function saveDesktopPc(id: string, data: DesktopPcFormValues & { highlights: string[] }): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/desktop-pcs/${id}`, toApiBody(data)).then(() => undefined)
}

export function createDesktopPc(data: DesktopPcFormValues & { highlights: string[] }): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-dpc-${Date.now()}` })
  return api.post<{ id: string }>('/desktop-pcs', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteDesktopPc(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/desktop-pcs/${id}`).then(() => undefined)
}
