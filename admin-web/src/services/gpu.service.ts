import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { GpuFormValues } from '../schemas/gpu.schema'
import type { Gpu } from '../types/gpu'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const baseSpecs = {
  baseClock: '1500 MHz',
  memoryClock: '18000 MHz',
  hdmiPort: '1x HDMI 2.1',
  displayPort: '3x DisplayPort 1.4a',
  openGl: '4.6',
  cudaCores: '5888',
  powerConnector: '1x 8-pin',
  powerRequirement: '600W',
  memoryInterface: '192-bit',
  dimension: '242 x 112 x 50 mm',
  boostClock: '2610 MHz',
  warranty: '36 เดือน',
  pcieInterface: 'PCIe 4.0 x16',
}

// Sample catalog for previewing the UI while the real Supabase catalog is
// still empty — matches the current Gpu shape exactly. Remove/ignore once
// USE_MOCK_DATA is flipped back to false in lib/mockMode.ts.
const mockGpus: Gpu[] = [
  {
    id: 'mock-gpu-1',
    sku: 'GPU-NV-4070TIS',
    name: 'NVIDIA GeForce RTX 4070 Ti SUPER',
    brand: 'NVIDIA',
    series: 'GeForce RTX 40 Series',
    model: 'RTX 4070 Ti SUPER',
    chipsetModel: 'AD103',
    memorySize: '16GB GDDR6X',
    sellingPrice: 32900,
    stock: 14,
    status: 'active',
    specs: { ...baseSpecs, cudaCores: '8448', memoryInterface: '256-bit' },
    description: 'การ์ดจอระดับไฮเอนด์สำหรับเล่นเกม 1440p-4K และงานตัดต่อวิดีโอ',
    updatedAt: '2026-06-12T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-2',
    sku: 'GPU-AMD-7800XT',
    name: 'AMD Radeon RX 7800 XT',
    brand: 'AMD',
    series: 'Radeon RX 7000 Series',
    model: 'RX 7800 XT',
    chipsetModel: 'Navi 32',
    memorySize: '16GB GDDR6',
    sellingPrice: 21900,
    stock: 22,
    status: 'active',
    specs: { ...baseSpecs, cudaCores: 'N/A (3840 Stream Processors)', memoryInterface: '256-bit' },
    description: 'คุ้มค่าสำหรับเกมมิ่ง 1440p ประสิทธิภาพสูงในราคาที่จับต้องได้',
    updatedAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-3',
    sku: 'GPU-NV-4060',
    name: 'NVIDIA GeForce RTX 4060',
    brand: 'NVIDIA',
    series: 'GeForce RTX 40 Series',
    model: 'RTX 4060',
    chipsetModel: 'AD107',
    memorySize: '8GB GDDR6',
    sellingPrice: 10900,
    stock: 45,
    status: 'active',
    specs: { ...baseSpecs, cudaCores: '3072', memoryInterface: '128-bit', powerRequirement: '450W' },
    description: 'ตัวเลือกยอดนิยมสำหรับเกมเมอร์งบประหยัด รองรับ DLSS 3',
    updatedAt: '2026-04-02T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-4',
    sku: 'GPU-NV-4090',
    name: 'NVIDIA GeForce RTX 4090',
    brand: 'NVIDIA',
    series: 'GeForce RTX 40 Series',
    model: 'RTX 4090',
    chipsetModel: 'AD102',
    memorySize: '24GB GDDR6X',
    sellingPrice: 68900,
    stock: 3,
    status: 'low_stock',
    specs: { ...baseSpecs, cudaCores: '16384', memoryInterface: '384-bit', powerRequirement: '850W', powerConnector: '1x 16-pin' },
    description: 'เรือธงสูงสุดสำหรับเกม 4K และงานเรนเดอร์ 3D ระดับมืออาชีพ',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-5',
    sku: 'GPU-AMD-6600',
    name: 'AMD Radeon RX 6600',
    brand: 'AMD',
    series: 'Radeon RX 6000 Series',
    model: 'RX 6600',
    chipsetModel: 'Navi 23',
    memorySize: '8GB GDDR6',
    sellingPrice: 6490,
    stock: 0,
    status: 'out_of_stock',
    specs: { ...baseSpecs, cudaCores: 'N/A (1792 Stream Processors)', memoryInterface: '128-bit', powerRequirement: '350W' },
    description: 'การ์ดจอระดับเริ่มต้นที่คุ้มค่าสำหรับเล่นเกม 1080p',
    updatedAt: '2026-03-11T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-6',
    sku: 'GPU-NV-4080S',
    name: 'NVIDIA GeForce RTX 4080 SUPER',
    brand: 'NVIDIA',
    series: 'GeForce RTX 40 Series',
    model: 'RTX 4080 SUPER',
    chipsetModel: 'AD103',
    memorySize: '16GB GDDR6X',
    sellingPrice: 44900,
    stock: 9,
    status: 'active',
    specs: { ...baseSpecs, cudaCores: '10240', memoryInterface: '256-bit', powerRequirement: '750W' },
    description: 'ประสิทธิภาพใกล้เคียง RTX 4090 ในราคาที่เข้าถึงง่ายกว่า',
    updatedAt: '2026-05-28T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-7',
    sku: 'GPU-AMD-7900XTX',
    name: 'AMD Radeon RX 7900 XTX',
    brand: 'AMD',
    series: 'Radeon RX 7000 Series',
    model: 'RX 7900 XTX',
    chipsetModel: 'Navi 31',
    memorySize: '24GB GDDR6',
    sellingPrice: 42900,
    stock: 6,
    status: 'preorder',
    specs: { ...baseSpecs, cudaCores: 'N/A (6144 Stream Processors)', memoryInterface: '384-bit', powerRequirement: '800W' },
    description: 'เรือธงฝั่ง AMD สำหรับเล่นเกม 4K และงานสร้างสรรค์',
    updatedAt: '2026-06-09T10:00:00.000Z',
  },
  {
    id: 'mock-gpu-8',
    sku: 'GPU-NV-3060',
    name: 'NVIDIA GeForce RTX 3060',
    brand: 'NVIDIA',
    series: 'GeForce RTX 30 Series',
    model: 'RTX 3060',
    chipsetModel: 'GA106',
    memorySize: '12GB GDDR6',
    sellingPrice: 8990,
    stock: 4,
    status: 'discontinued',
    specs: { ...baseSpecs, cudaCores: '3584', memoryInterface: '192-bit', powerRequirement: '550W' },
    description: 'รุ่นก่อนหน้าที่ยังได้รับความนิยม (เลิกจำหน่าย เหลือสต็อกจำกัด)',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
]

// Prisma's Decimal fields (sellingPrice) serialize to JSON as strings, not
// numbers — coerce here so arithmetic/sorting/toLocaleString downstream isn't
// silently operating on strings.
function fromApi(row: any): Gpu {
  return { ...row, sellingPrice: Number(row.sellingPrice) }
}

export function getGpus(): Promise<Gpu[]> {
  if (USE_MOCK_DATA) return mockDelay(mockGpus)
  return api.get<Gpu[]>('/gpus').then((res) => res.data.map(fromApi))
}

export function getGpuDetail(id: string): Promise<Gpu | null> {
  if (USE_MOCK_DATA) return mockDelay(mockGpus.find((gpu) => gpu.id === id) ?? null)
  return api
    .get<Gpu>(`/gpus/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveGpu(id: string, data: GpuFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/gpus/${id}`, data).then(() => undefined)
}

export function createGpu(data: GpuFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-gpu-${Date.now()}` })
  return api.post<Gpu>('/gpus', data).then((res) => ({ id: res.data.id }))
}

export function deleteGpu(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/gpus/${id}`).then(() => undefined)
}
