import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { CustomBuildCreateFormValues, CustomBuildEditFormValues } from '../schemas/customBuild.schema'
import type { CustomBuild, CustomBuildPrices } from '../types/customBuild'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Backend Decimal fields (`prices.<slot>`, `total`) serialize as strings over
// JSON — coerce to numbers here so arithmetic/sorting/toLocaleString work.
function fromApi(raw: any): CustomBuild {
  const prices = Object.fromEntries(
    Object.entries(raw.prices ?? {}).map(([slot, price]) => [slot, Number(price)]),
  ) as unknown as CustomBuildPrices
  return {
    ...raw,
    customer: raw.customerNameSnapshot,
    prices,
    total: Number(raw.total),
  }
}

function mockPrices(overrides: Partial<CustomBuildPrices>): CustomBuildPrices {
  const base: CustomBuildPrices = { cpu: 9900, gpu: 15900, motherboard: 5900, ram: 2900, storage: 2900, psu: 2900, case: 1900, cooling: 1500 }
  return { ...base, ...overrides }
}

function mockTotal(prices: CustomBuildPrices): number {
  return Object.values(prices).reduce((sum, p) => sum + p, 0)
}

const mockComponentIds = (idx: number) => ({
  cpu: `mock-cpu-${idx}`, gpu: `mock-gpu-${idx}`, motherboard: `mock-mb-${idx}`, ram: `mock-ram-${idx}`,
  storage: `mock-storage-${idx}`, psu: `mock-psu-${idx}`, case: `mock-case-${idx}`, cooling: `mock-cooling-${idx}`,
})

const buildEntries: Array<[string, string, CustomBuild['status'], CustomBuild['components'], CustomBuildPrices, string]> = [
  ['ORD-2026091001', 'สมชาย ใจดี', 'done', { cpu: 'Intel Core i7-14700K', gpu: 'RTX 4070 Ti SUPER 16GB', motherboard: 'ASUS ROG STRIX Z790-E', ram: 'DDR5 32GB 6000MHz', storage: 'NVMe SSD 1TB Gen4', psu: '850W 80+ Gold', case: 'Lian Li O11 Dynamic', cooling: 'AIO 240mm' }, mockPrices({ cpu: 13900, gpu: 32900 }), 'ลูกค้าต้องการชุดเกมมิ่งระดับสูง'],
  ['ORD-2026091002', 'สุนีย์ พงษ์ไพร', 'in_progress', { cpu: 'AMD Ryzen 5 7600', gpu: 'RTX 4060 8GB', motherboard: 'MSI B650M', ram: 'DDR5 16GB 5600MHz', storage: 'NVMe SSD 500GB Gen4', psu: '650W 80+ Bronze', case: 'NZXT H510', cooling: 'Air Cooler' }, mockPrices({ cpu: 7900, gpu: 12900 }), 'กำลังประกอบ คาดว่าเสร็จใน 3 วัน'],
  ['ORD-2026090903', 'ธนากร วงศ์สกุล', 'pending', { cpu: 'Intel Core i5-14400F', gpu: 'RTX 4060 Ti 16GB', motherboard: 'ASUS PRIME B760M', ram: 'DDR5 16GB 5600MHz', storage: 'NVMe SSD 1TB Gen4', psu: '650W 80+ Bronze', case: 'Mid Tower ATX', cooling: 'Air Cooler' }, mockPrices({ cpu: 6900, gpu: 18900 }), 'รอยืนยันการชำระเงิน'],
  ['ORD-2026090804', 'วรรณา ศรีสุข', 'done', { cpu: 'AMD Ryzen 9 7950X', gpu: 'RTX 4090 24GB', motherboard: 'ASUS ProArt X670E', ram: 'DDR5 64GB 6000MHz', storage: 'NVMe SSD 2TB Gen4', psu: '1200W 80+ Platinum', case: 'Fractal Define 7 XL', cooling: 'AIO 360mm' }, mockPrices({ cpu: 19900, gpu: 62900, ram: 6900, storage: 5900, psu: 8900 }), 'ลูกค้าใช้งาน AI/Rendering'],
  ['ORD-2026090705', 'ประเสริฐ บุญมี', 'cancelled', { cpu: 'Intel Core i3-14100', gpu: 'GTX 1650 4GB', motherboard: 'H610M', ram: 'DDR4 8GB', storage: 'SATA SSD 480GB', psu: '450W 80+ White', case: 'Micro ATX', cooling: 'Stock Cooler' }, mockPrices({ cpu: 3900, gpu: 4900, ram: 990, storage: 990, psu: 890, case: 890, cooling: 0 }), 'ลูกค้ายกเลิกคำสั่งซื้อ'],
  ['ORD-2026090606', 'กมลชนก อินทร์แก้ว', 'in_progress', { cpu: 'AMD Ryzen 7 7800X3D', gpu: 'RTX 4070 SUPER 12GB', motherboard: 'MSI MAG B650 Tomahawk', ram: 'DDR5 32GB 6000MHz', storage: 'NVMe SSD 2TB Gen4', psu: '750W 80+ Gold', case: 'Corsair 4000D', cooling: 'AIO 280mm' }, mockPrices({ cpu: 11900, gpu: 22900, storage: 5900 }), 'สายเกมมิ่ง ต้องการเฟรมเรตสูงสุด'],
]

const MOCK_CUSTOM_BUILDS: CustomBuild[] = buildEntries.map(([orderNo, customer, status, components, prices, notes], i) => ({
  id: `mock-build-${i + 1}`,
  orderNo,
  customer,
  status,
  components,
  componentIds: mockComponentIds(i + 1),
  prices,
  total: mockTotal(prices),
  notes,
  aiPreviewImageUrl: null,
  createdAt: `2026-09-${String(10 - i).padStart(2, '0')}T10:00:00.000Z`,
  updatedAt: `2026-09-${String(10 - i).padStart(2, '0')}T10:00:00.000Z`,
}))

export function getCustomBuilds(): Promise<CustomBuild[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_CUSTOM_BUILDS)
  return api.get<any[]>('/custom-builds').then((res) => res.data.map(fromApi))
}

export function getCustomBuildDetail(id: string): Promise<CustomBuild | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_CUSTOM_BUILDS.find((item) => item.id === id) ?? null)
  return api
    .get<any>(`/custom-builds/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

// ponytail: CustomBuild.orderNo is required + unique with no backend default
// (see Backend-web/prisma/schema.prisma) and there's no admin field for it —
// generate a unique-enough number client-side. Swap for a server-side
// sequence if collisions ever matter at real volume.
function generateOrderNo(): string {
  return `ORD-${Date.now()}`
}

export function saveCustomBuild(id: string, data: CustomBuildEditFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/custom-builds/${id}`, data).then(() => undefined)
}

export function createCustomBuild(data: CustomBuildCreateFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-build-${Date.now()}` })
  const { customer, ...rest } = data
  const body = { ...rest, customerNameSnapshot: customer, orderNo: generateOrderNo() }
  return api.post<{ id: string }>('/custom-builds', body).then((res) => ({ id: res.data.id }))
}

export function uploadAiPreviewImage(id: string, file: File): Promise<CustomBuild> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_CUSTOM_BUILDS.find((item) => item.id === id) ?? MOCK_CUSTOM_BUILDS[0]
    return mockDelay({ ...existing, aiPreviewImageUrl: URL.createObjectURL(file) })
  }
  const formData = new FormData()
  formData.append('image', file)
  return api.post<any>(`/custom-builds/${id}/ai-preview-image`, formData).then((res) => fromApi(res.data))
}
