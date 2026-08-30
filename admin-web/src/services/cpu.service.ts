import type { CpuFormValues } from '../schemas/cpu.schema'
import type { Cpu, CpuSummary } from '../types/cpu'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const empty = { benchmarks: [], videoLinks: [], description: '' }

const cpus: Cpu[] = [
  { id: '1', sku: 'CPU-AMD-001', name: 'AMD Ryzen 5 5600X', brand: 'AMD', series: '5000 Series', processorLine: 'Ryzen 5', socket: 'AM4', processorNumber: 'Ryzen 5 5600X', coresThreads: '6 Cores / 12 Threads', baseFrequency: '3.7 GHz', maxTurboFrequency: '4.6 GHz', l2Cache: '3 MB', l3Cache: '32 MB', graphics: 'N/A', tdp: '65W', maxTdp: '76W', warranty: '3 Years', sellingPrice: 5450, costPrice: 4200, discount: 0, stock: 24, publishImmediately: true, ...empty },
  { id: '2', sku: 'CPU-AMD-002', name: 'AMD Ryzen 7 7700X', brand: 'AMD', series: '7000 Series', processorLine: 'Ryzen 7', socket: 'AM5', processorNumber: 'Ryzen 7 7700X', coresThreads: '8 Cores / 16 Threads', baseFrequency: '4.5 GHz', maxTurboFrequency: '5.4 GHz', l2Cache: '8 MB', l3Cache: '32 MB', graphics: 'AMD Radeon Graphics', tdp: '105W', maxTdp: '142W', warranty: '3 Years', sellingPrice: 11900, costPrice: 9500, discount: 0, stock: 12, publishImmediately: true, ...empty },
  { id: '3', sku: 'CPU-AMD-003', name: 'AMD Ryzen 9 9950X', brand: 'AMD', series: '9000 Series', processorLine: 'Ryzen 9', socket: 'AM5', processorNumber: 'Ryzen 9 9950X', coresThreads: '16 Cores / 32 Threads', baseFrequency: '4.3 GHz', maxTurboFrequency: '5.7 GHz', l2Cache: '16 MB', l3Cache: '64 MB', graphics: 'AMD Radeon Graphics', tdp: '170W', maxTdp: '230W', warranty: '3 Years', sellingPrice: 23900, costPrice: 19800, discount: 0, stock: 4, publishImmediately: true, ...empty },
  { id: '4', sku: 'CPU-AMD-004', name: 'AMD Ryzen 9 7950X', brand: 'AMD', series: '7000 Series', processorLine: 'Ryzen 9', socket: 'AM5', processorNumber: 'Ryzen 9 7950X', coresThreads: '16 Cores / 32 Threads', baseFrequency: '4.5 GHz', maxTurboFrequency: '5.7 GHz', l2Cache: '16 MB', l3Cache: '64 MB', graphics: 'AMD Radeon Graphics', tdp: '170W', maxTdp: '230W', warranty: '3 Years', sellingPrice: 18900, costPrice: 15600, discount: 0, stock: 18, publishImmediately: true, ...empty },
  { id: '5', sku: 'CPU-INT-001', name: 'Intel Core i5-14600K', brand: 'Intel', series: '14th Gen', processorLine: 'CORE i5', socket: 'LGA 1700', processorNumber: 'Core i5-14600K', coresThreads: '14 Cores / 20 Threads', baseFrequency: '3.5 GHz', maxTurboFrequency: '5.3 GHz', l2Cache: '20 MB', l3Cache: '24 MB', graphics: 'Intel UHD Graphics 770', tdp: '125W', maxTdp: '181W', warranty: '3 Years', sellingPrice: 11500, costPrice: 9200, discount: 0, stock: 32, publishImmediately: true, ...empty },
  { id: '6', sku: 'CPU-INT-002', name: 'Intel Core i7-14700K', brand: 'Intel', series: '14th Gen', processorLine: 'CORE i7', socket: 'LGA 1700', processorNumber: 'Core i7-14700K', coresThreads: '20 Cores / 28 Threads', baseFrequency: '3.4 GHz', maxTurboFrequency: '5.6 GHz', l2Cache: '28 MB', l3Cache: '33 MB', graphics: 'Intel UHD Graphics 770', tdp: '125W', maxTdp: '253W', warranty: '3 Years', sellingPrice: 15900, costPrice: 13100, discount: 0, stock: 15, publishImmediately: true, ...empty },
  { id: '7', sku: 'CPU-INT-003', name: 'Intel Core i9-14900K', brand: 'Intel', series: '14th Gen', processorLine: 'CORE i7', socket: 'LGA 1700', processorNumber: 'Core i9-14900K', coresThreads: '24 Cores / 32 Threads', baseFrequency: '3.2 GHz', maxTurboFrequency: '6.0 GHz', l2Cache: '32 MB', l3Cache: '36 MB', graphics: 'Intel UHD Graphics 770', tdp: '125W', maxTdp: '253W', warranty: '3 Years', sellingPrice: 21900, costPrice: 18300, discount: 0, stock: 3, publishImmediately: true, ...empty },
  { id: '8', sku: 'CPU-INT-004', name: 'Intel Core Ultra 7 265K', brand: 'Intel', series: 'CORE ULTRA', processorLine: 'ULTRA 7', socket: 'LGA 1851', processorNumber: 'Core Ultra 7 265K', coresThreads: '20 Cores / 20 Threads', baseFrequency: '3.9 GHz', maxTurboFrequency: '5.5 GHz', l2Cache: '36 MB', l3Cache: '30 MB', graphics: 'Intel Graphics', tdp: '125W', maxTdp: '250W', warranty: '3 Years', sellingPrice: 16200, costPrice: 13400, discount: 0, stock: 8, publishImmediately: true, ...empty },
  { id: '9', sku: 'CPU-AMD-005', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD', series: '9000 Series', processorLine: 'Ryzen 7', socket: 'AM5', processorNumber: 'Ryzen 7 9800X3D', coresThreads: '8 Cores / 16 Threads', baseFrequency: '4.7 GHz', maxTurboFrequency: '5.2 GHz', l2Cache: '8 MB', l3Cache: '96 MB', graphics: 'AMD Radeon Graphics', tdp: '120W', maxTdp: '162W', warranty: '3 Years', sellingPrice: 17900, costPrice: 15200, discount: 0, stock: 0, publishImmediately: true, ...empty },
  { id: '10', sku: 'CPU-INT-005', name: 'Intel Core i5-12400F', brand: 'Intel', series: '12th Gen', processorLine: 'CORE i5', socket: 'LGA 1700', processorNumber: 'Core i5-12400F', coresThreads: '6 Cores / 12 Threads', baseFrequency: '2.5 GHz', maxTurboFrequency: '4.4 GHz', l2Cache: '7.5 MB', l3Cache: '18 MB', graphics: 'N/A', tdp: '65W', maxTdp: '117W', warranty: '3 Years', sellingPrice: 3950, costPrice: 3100, discount: 0, stock: 45, publishImmediately: true, ...empty },
]

export function getCpuSummary(): Promise<CpuSummary> {
  return mockDelay({ total: 10, totalStock: 161, lowStock: 6, outOfStock: 1 })
}

export function getCpus(): Promise<Cpu[]> {
  return mockDelay(cpus)
}

export function getCpuDetail(id: string): Promise<Cpu | null> {
  return mockDelay(cpus.find((cpu) => cpu.id === id) ?? null)
}

export function saveCpu(
  _id: string,
  _data: CpuFormValues & { benchmarks: Cpu['benchmarks']; videoLinks: string[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createCpu(
  _data: CpuFormValues & { benchmarks: Cpu['benchmarks']; videoLinks: string[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(cpus.length + 1) })
}

export function deleteCpu(_id: string): Promise<void> {
  return mockDelay(undefined)
}
