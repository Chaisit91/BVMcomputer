import type { GpuFormValues } from '../schemas/gpu.schema'
import type { Gpu, GpuSummary } from '../types/gpu'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const gpus: Gpu[] = [
  {
    id: '1', sku: 'GPU-4090-1', name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X',
    brand: 'ASUS', series: 'NVIDIA GeForce RTX 40 Series', model: 'RTX 4090', chipsetModel: 'NVIDIA RTX 4090',
    memorySize: '24GB', price: 78900, stock: 8, status: 'available',
    specs: { baseClock: '2235 MHz', memoryClock: '21 Gbps', hdmiPort: '1 x HDMI 2.1b', displayPort: '3 x DisplayPort 1.4a', openGl: 'OpenGL 4.6', cudaCores: '16384', powerConnector: '1 x 16-pin', powerRequirement: '850W', memoryInterface: '384-bit', dimension: '357.6 x 149.3 x 70.1 mm', boostClock: '2640 MHz', warranty: '3 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '20/08/2025',
  },
  {
    id: '2', sku: 'GPU-4090-2', name: 'GIGABYTE GeForce RTX 4070 Ti SUPER WINDFORCE OC',
    brand: 'GIGABYTE', series: 'NVIDIA GeForce RTX 40 Series', model: 'RTX 4070 Ti Super', chipsetModel: 'NVIDIA RTX 4070 Ti Super',
    memorySize: '16GB', price: 34900, stock: 15, status: 'available',
    specs: { baseClock: '2295 MHz', memoryClock: '21 Gbps', hdmiPort: '1 x HDMI 2.1', displayPort: '3 x DisplayPort 1.4a', openGl: 'OpenGL 4.6', cudaCores: '8448', powerConnector: '1 x 16-pin', powerRequirement: '750W', memoryInterface: '256-bit', dimension: '330.5 x 140 x 60 mm', boostClock: '2610 MHz', warranty: '3 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '19/08/2025',
  },
  {
    id: '3', sku: 'GPU-4090-3', name: 'MSI GeForce RTX 4060 Ti VENTUS 2X BLACK 8G',
    brand: 'MSI', series: 'NVIDIA GeForce RTX 40 Series', model: 'RTX 4060 Ti', chipsetModel: 'NVIDIA RTX 4060 Ti',
    memorySize: '8GB', price: 15500, stock: 23, status: 'preorder',
    specs: { baseClock: '2310 MHz', memoryClock: '18 Gbps', hdmiPort: '1 x HDMI 2.1', displayPort: '3 x DisplayPort 1.4a', openGl: 'OpenGL 4.6', cudaCores: '4352', powerConnector: '1 x 8-pin', powerRequirement: '550W', memoryInterface: '128-bit', dimension: '270 x 126 x 42 mm', boostClock: '2565 MHz', warranty: '3 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '18/08/2025',
  },
  {
    id: '4', sku: 'GPU-4090-4', name: 'Sapphire NITRO+ AMD Radeon RX 7800 XT 16GB',
    brand: 'SAPPHIRE', series: 'AMD Radeon RX 7000 Series', model: 'RX 7800 XT', chipsetModel: 'AMD RX 7800 XT',
    memorySize: '16GB', price: 20900, stock: 3, status: 'available',
    specs: { baseClock: '1295 MHz', memoryClock: '19.5 Gbps', hdmiPort: '1 x HDMI 2.1', displayPort: '3 x DisplayPort 2.1', openGl: 'OpenGL 4.6', cudaCores: 'N/A', powerConnector: '2 x 8-pin', powerRequirement: '750W', memoryInterface: '256-bit', dimension: '320 x 135 x 55 mm', boostClock: '2430 MHz', warranty: '2 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '17/08/2025',
  },
  {
    id: '5', sku: 'GPU-4090-5', name: 'PowerColor Hellhound AMD Radeon RX 7600 XT',
    brand: 'POWERCOLOR', series: 'AMD Radeon RX 7000 Series', model: 'RX 7600', chipsetModel: 'AMD RX 7600 XT',
    memorySize: '16GB', price: 11800, stock: 0, status: 'discontinued',
    specs: { baseClock: '1720 MHz', memoryClock: '18 Gbps', hdmiPort: '1 x HDMI 2.1', displayPort: '3 x DisplayPort 2.1', openGl: 'OpenGL 4.6', cudaCores: 'N/A', powerConnector: '1 x 8-pin', powerRequirement: '550W', memoryInterface: '128-bit', dimension: '278 x 128 x 50 mm', boostClock: '2755 MHz', warranty: '2 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '10/08/2025',
  },
  {
    id: '6', sku: 'GPU-4090-6', name: 'GALAX GeForce RTX 3060 1-Click OC 12GB GDDR6',
    brand: 'GALAX', series: 'NVIDIA GeForce RTX 30 Series', model: 'RTX 3060', chipsetModel: 'NVIDIA RTX 3060',
    memorySize: '12GB', price: 9790, stock: 42, status: 'available',
    specs: { baseClock: '1320 MHz', memoryClock: '15 Gbps', hdmiPort: '1 x HDMI 2.1', displayPort: '3 x DisplayPort 1.4a', openGl: 'OpenGL 4.6', cudaCores: '3584', powerConnector: '1 x 8-pin', powerRequirement: '550W', memoryInterface: '192-bit', dimension: '280 x 128 x 46 mm', boostClock: '1837 MHz', warranty: '3 ปี', pcieInterface: 'PCIe 4.0 x16' },
    description: '', updatedAt: '15/08/2025',
  },
]

export function getGpuSummary(): Promise<GpuSummary> {
  return mockDelay({ total: 561 })
}

export function getGpus(): Promise<Gpu[]> {
  return mockDelay(gpus)
}

export function getGpuDetail(id: string): Promise<Gpu | null> {
  return mockDelay(gpus.find((gpu) => gpu.id === id) ?? null)
}

export function saveGpu(_id: string, _data: GpuFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createGpu(_data: GpuFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(gpus.length + 1) })
}

export function deleteGpu(_id: string): Promise<void> {
  return mockDelay(undefined)
}
