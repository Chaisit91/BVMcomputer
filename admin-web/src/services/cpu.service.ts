import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoPriceField } from '../lib/promoPrice'
import type { CpuFormValues } from '../schemas/cpu.schema'
import type { Cpu, CpuBenchmark } from '../types/cpu'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Sample catalog for previewing the UI while the real Supabase catalog is
// still empty — matches the current Cpu shape exactly. Remove/ignore once
// USE_MOCK_DATA is flipped back to false in lib/mockMode.ts.
const mockCpus: Cpu[] = [
  {
    id: 'mock-cpu-1',
    sku: 'CPU-INT-14400F',
    name: 'Intel Core i5-14400F',
    brand: 'Intel',
    series: '14th Gen',
    processorLine: 'CORE i5',
    socket: 'LGA 1700',
    processorNumber: 'i5-14400F',
    cores: 10,
    threads: 16,
    baseFrequencyGhz: 2.5,
    maxTurboFrequencyGhz: 4.7,
    l2CacheMb: 9.5,
    l3CacheMb: 20,
    graphics: 'N/A',
    tdpWatts: 65,
    maxTdpWatts: 148,
    warrantyMonths: 36,
    sellingPrice: 6490,
    costPrice: 5400,
    promoPrice: null,
    stock: 42,
    status: 'active',
    publishImmediately: true,
    benchmarks: [{ id: 'b1', name: 'Cinebench R23 Multi', score: 15200, unit: 'pts' }],
    videoLinks: [],
    description: 'ซีพียูรุ่นกลางสำหรับงานทั่วไปและเล่นเกม คุ้มค่าในราคาประหยัด',
  },
  {
    id: 'mock-cpu-2',
    sku: 'CPU-AMD-7800X3D',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    series: '7000 Series',
    processorLine: 'Ryzen 7',
    socket: 'AM5',
    processorNumber: '7800X3D',
    cores: 8,
    threads: 16,
    baseFrequencyGhz: 4.2,
    maxTurboFrequencyGhz: 5.0,
    l2CacheMb: 8,
    l3CacheMb: 96,
    graphics: 'AMD Radeon Graphics',
    tdpWatts: 120,
    maxTdpWatts: 162,
    warrantyMonths: 36,
    sellingPrice: 12900,
    costPrice: 10800,
    promoPrice: 11900,
    stock: 15,
    status: 'active',
    publishImmediately: true,
    benchmarks: [{ id: 'b1', name: 'Cinebench R23 Multi', score: 18900, unit: 'pts' }],
    videoLinks: ['https://youtube.com/watch?v=demo7800x3d'],
    description: 'ตัวแรงสำหรับเกมเมอร์ ด้วย 3D V-Cache ให้เฟรมเรตสูงสุดในเกมยอดนิยม',
  },
  {
    id: 'mock-cpu-3',
    sku: 'CPU-INT-13600K',
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    series: '13th Gen',
    processorLine: 'CORE i7',
    socket: 'LGA 1700',
    processorNumber: 'i7-13700K',
    cores: 16,
    threads: 24,
    baseFrequencyGhz: 3.4,
    maxTurboFrequencyGhz: 5.4,
    l2CacheMb: 24,
    l3CacheMb: 30,
    graphics: 'Intel UHD Graphics 770',
    tdpWatts: 125,
    maxTdpWatts: 253,
    warrantyMonths: 36,
    sellingPrice: 14200,
    costPrice: 12000,
    promoPrice: null,
    stock: 8,
    status: 'low_stock',
    publishImmediately: true,
    benchmarks: [{ id: 'b1', name: 'Cinebench R23 Multi', score: 27800, unit: 'pts' }],
    videoLinks: [],
    description: 'ประสิทธิภาพสูงสำหรับงานสร้างสรรค์และเกมมิ่งระดับเรือธง',
  },
  {
    id: 'mock-cpu-4',
    sku: 'CPU-AMD-9950X',
    name: 'AMD Ryzen 9 9950X',
    brand: 'AMD',
    series: '9000 Series',
    processorLine: 'Ryzen 9',
    socket: 'AM5',
    processorNumber: '9950X',
    cores: 16,
    threads: 32,
    baseFrequencyGhz: 4.3,
    maxTurboFrequencyGhz: 5.7,
    l2CacheMb: 16,
    l3CacheMb: 64,
    graphics: 'AMD Radeon Graphics',
    tdpWatts: 170,
    maxTdpWatts: 230,
    warrantyMonths: 36,
    sellingPrice: 21900,
    costPrice: 18500,
    promoPrice: null,
    stock: 0,
    status: 'out_of_stock',
    publishImmediately: true,
    benchmarks: [],
    videoLinks: [],
    description: 'เรือธงสำหรับงานตัดต่อ เรนเดอร์ และมัลติทาสก์หนักๆ',
  },
  {
    id: 'mock-cpu-5',
    sku: 'CPU-INT-ULTRA5',
    name: 'Intel Core Ultra 5 245K',
    brand: 'Intel',
    series: 'CORE ULTRA',
    processorLine: 'ULTRA 5',
    socket: 'LGA 1851',
    processorNumber: 'Ultra 5 245K',
    cores: 14,
    threads: 14,
    baseFrequencyGhz: 3.6,
    maxTurboFrequencyGhz: 5.2,
    l2CacheMb: 20,
    l3CacheMb: 24,
    graphics: 'Intel Graphics',
    tdpWatts: 125,
    maxTdpWatts: 159,
    warrantyMonths: 36,
    sellingPrice: 9990,
    costPrice: 8400,
    promoPrice: null,
    stock: 25,
    status: 'active',
    publishImmediately: true,
    benchmarks: [],
    videoLinks: [],
    description: 'สถาปัตยกรรมใหม่ล่าสุด ประหยัดพลังงานกว่ารุ่นก่อนหน้า',
  },
  {
    id: 'mock-cpu-6',
    sku: 'CPU-AMD-5600',
    name: 'AMD Ryzen 5 5600',
    brand: 'AMD',
    series: '5000 Series',
    processorLine: 'Ryzen 5',
    socket: 'AM4',
    processorNumber: '5600',
    cores: 6,
    threads: 12,
    baseFrequencyGhz: 3.5,
    maxTurboFrequencyGhz: 4.4,
    l2CacheMb: 3,
    l3CacheMb: 32,
    graphics: 'N/A',
    tdpWatts: 65,
    maxTdpWatts: 88,
    warrantyMonths: 36,
    sellingPrice: 3990,
    costPrice: 3200,
    promoPrice: 3590,
    stock: 60,
    status: 'active',
    publishImmediately: true,
    benchmarks: [{ id: 'b1', name: 'Cinebench R23 Multi', score: 9800, unit: 'pts' }],
    videoLinks: [],
    description: 'ตัวเลือกยอดนิยมสำหรับสายประหยัด แพลตฟอร์ม AM4 ที่ยังคุ้มค่า',
  },
  {
    id: 'mock-cpu-7',
    sku: 'CPU-AMD-7970WX',
    name: 'AMD Ryzen Threadripper PRO 7975WX',
    brand: 'AMD',
    series: '7000 WX-Series',
    processorLine: 'RYZEN THREADRIPPER',
    socket: 'sTR5',
    processorNumber: '7975WX',
    cores: 32,
    threads: 64,
    baseFrequencyGhz: 4.0,
    maxTurboFrequencyGhz: 5.3,
    l2CacheMb: 32,
    l3CacheMb: 128,
    graphics: 'N/A',
    tdpWatts: 350,
    maxTdpWatts: 350,
    warrantyMonths: 36,
    sellingPrice: 89900,
    costPrice: 79000,
    promoPrice: null,
    stock: 3,
    status: 'preorder',
    publishImmediately: false,
    benchmarks: [],
    videoLinks: [],
    description: 'สำหรับงานเวิร์คสเตชันระดับมืออาชีพ เรนเดอร์ 3D และจำลองข้อมูลขนาดใหญ่',
  },
  {
    id: 'mock-cpu-8',
    sku: 'CPU-INT-12100F',
    name: 'Intel Core i3-12100F',
    brand: 'Intel',
    series: '12th Gen',
    processorLine: 'CORE i3',
    socket: 'LGA 1700',
    processorNumber: 'i3-12100F',
    cores: 4,
    threads: 8,
    baseFrequencyGhz: 3.3,
    maxTurboFrequencyGhz: 4.3,
    l2CacheMb: 5,
    l3CacheMb: 12,
    graphics: 'N/A',
    tdpWatts: 58,
    maxTdpWatts: 89,
    warrantyMonths: 36,
    sellingPrice: 2790,
    costPrice: 2250,
    promoPrice: null,
    stock: 5,
    status: 'discontinued',
    publishImmediately: false,
    benchmarks: [],
    videoLinks: [],
    description: 'ซีพียูราคาประหยัดสำหรับคอมพิวเตอร์สำนักงาน (เลิกจำหน่าย รุ่นเก่า)',
  },
  {
    id: 'mock-cpu-9',
    sku: 'CPU-AMD-7600X',
    name: 'AMD Ryzen 5 7600X',
    brand: 'AMD',
    series: '7000 Series',
    processorLine: 'Ryzen 5',
    socket: 'AM5',
    processorNumber: '7600X',
    cores: 6,
    threads: 12,
    baseFrequencyGhz: 4.7,
    maxTurboFrequencyGhz: 5.3,
    l2CacheMb: 6,
    l3CacheMb: 32,
    graphics: 'AMD Radeon Graphics',
    tdpWatts: 105,
    maxTdpWatts: 142,
    warrantyMonths: 36,
    sellingPrice: 8490,
    costPrice: 7100,
    promoPrice: null,
    stock: 30,
    status: 'active',
    publishImmediately: true,
    benchmarks: [],
    videoLinks: [],
    description: 'สมดุลระหว่างราคาและประสิทธิภาพสำหรับแพลตฟอร์ม AM5 รุ่นใหม่',
  },
  {
    id: 'mock-cpu-10',
    sku: 'CPU-INT-ULTRA7',
    name: 'Intel Core Ultra 7 265K',
    brand: 'Intel',
    series: 'CORE ULTRA',
    processorLine: 'ULTRA 7',
    socket: 'LGA 1851',
    processorNumber: 'Ultra 7 265K',
    cores: 20,
    threads: 20,
    baseFrequencyGhz: 3.9,
    maxTurboFrequencyGhz: 5.5,
    l2CacheMb: 24,
    l3CacheMb: 30,
    graphics: 'Intel Graphics',
    tdpWatts: 125,
    maxTdpWatts: 250,
    warrantyMonths: 36,
    sellingPrice: 15900,
    costPrice: 13400,
    promoPrice: 14900,
    stock: 12,
    status: 'active',
    publishImmediately: true,
    benchmarks: [{ id: 'b1', name: 'Cinebench R23 Multi', score: 34200, unit: 'pts' }],
    videoLinks: [],
    description: 'ตัวแรงระดับไฮเอนด์ รองรับงานสร้างสรรค์และเกมมิ่งพร้อมกัน',
  },
]

// Prisma Decimal columns (sellingPrice, costPrice, promoPrice,
// baseFrequencyGhz, maxTurboFrequencyGhz, CpuBenchmark.score) serialize to
// JSON as strings, not numbers — normalize them back on every read.
function toNum(value: unknown): number {
  return value == null ? 0 : Number(value)
}

function mapCpu(raw: any): Cpu {
  return {
    ...raw,
    sellingPrice: toNum(raw.sellingPrice),
    costPrice: raw.costPrice == null ? null : toNum(raw.costPrice),
    promoPrice: raw.promoPrice == null ? null : toNum(raw.promoPrice),
    baseFrequencyGhz: toNum(raw.baseFrequencyGhz),
    maxTurboFrequencyGhz: toNum(raw.maxTurboFrequencyGhz),
    benchmarks: (raw.benchmarks ?? []).map((b: any) => ({ ...b, score: toNum(b.score) })),
  }
}

type CpuSubmit = CpuFormValues & { benchmarks: CpuBenchmark[]; videoLinks: string[] }

function toPayload(data: CpuSubmit) {
  const { promoEnabled, promoPrice, benchmarks, videoLinks, ...rest } = data
  return {
    ...rest,
    promoPrice: toPromoPriceField(promoEnabled, promoPrice),
    benchmarks: benchmarks.map(({ name, score, unit }) => ({ name, score, unit })),
    videoLinks,
  }
}

export function getCpus(): Promise<Cpu[]> {
  if (USE_MOCK_DATA) return mockDelay(mockCpus)
  return api.get<any[]>('/cpus').then((res) => res.data.map(mapCpu))
}

export function getCpuDetail(id: string): Promise<Cpu | null> {
  if (USE_MOCK_DATA) return mockDelay(mockCpus.find((cpu) => cpu.id === id) ?? null)
  return api
    .get<any>(`/cpus/${id}`)
    .then((res) => mapCpu(res.data))
    .catch(() => null)
}

export function saveCpu(id: string, data: CpuSubmit): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/cpus/${id}`, toPayload(data)).then(() => undefined)
}

export function createCpu(data: CpuSubmit): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-cpu-${Date.now()}` })
  return api.post<{ id: string }>('/cpus', toPayload(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCpu(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/cpus/${id}`).then(() => undefined)
}
