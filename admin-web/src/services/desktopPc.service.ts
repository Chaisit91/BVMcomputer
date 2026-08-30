import type { DesktopPcFormValues } from '../schemas/desktopPc.schema'
import type { DesktopPc, DesktopPcSummary } from '../types/desktopPc'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const products: DesktopPc[] = [
  {
    id: '1',
    sku: 'AIWS-PRO-X1-2026',
    name: 'AI Workstation Pro X1',
    category: 'ai_workstation',
    status: 'selling',
    specSummary: 'Intel Xeon W-2495X + RTX 5090',
    price: 289000,
    stock: 3,
    description:
      'เวิร์กสเตชันระดับมืออาชีพสำหรับงาน AI, Machine Learning และ Deep Learning รองรับการประมวลผลข้อมูลขนาดใหญ่ การฝึก AI Model และ Inference ด้วยพลังจาก Intel Xeon W-2495X คู่กับ NVIDIA GeForce RTX 5090 พร้อม VRAM 32GB',
    highlights: ['AI/Machine Learning', 'Deep Learning', 'Data Science'],
    specs: {
      cpu: 'Intel Xeon W-2495X 24C/48T 4.9GHz',
      gpu: 'NVIDIA GeForce RTX 5090 32GB GDDR7',
      mainboard: 'ASUS Pro WS W790E-SAGE SE',
      ram: '128GB DDR5-5600 ECC',
      storage: '2TB Samsung 990 Pro NVMe + 4TB HDD',
      psu: 'Corsair HX1500i 1500W 80+ Platinum',
      case: 'Fractal Design Define 7 XL',
      cooling: 'Noctua NH-D15 chromax.black',
      os: 'Windows 11 Pro for Workstations',
      warranty: '3 Years On-site Service',
    },
    updatedAt: '20/08/2025',
  },
  {
    id: '2',
    sku: 'AIES-E1-2026',
    name: 'AI Enterprise Server E1',
    category: 'ai_enterprise',
    status: 'low_stock',
    specSummary: 'AMD EPYC 9554 + 2x RTX 5090',
    price: 589000,
    stock: 1,
    description: '',
    highlights: [],
    specs: {
      cpu: 'AMD EPYC 9554 64C/128T',
      gpu: '2x NVIDIA GeForce RTX 5090 32GB GDDR7',
      mainboard: 'Supermicro H13SSL-N',
      ram: '256GB DDR5-4800 ECC RDIMM',
      storage: '4TB NVMe RAID + 16TB HDD RAID',
      psu: 'Redundant 2000W 80+ Titanium',
      case: 'Rackmount 4U Server Chassis',
      cooling: 'Server-grade Active Cooling',
      os: 'Ubuntu Server 24.04 LTS',
      warranty: '5 Years On-site Service',
    },
    updatedAt: '19/08/2025',
  },
  {
    id: '3',
    sku: 'GDT-G7-2026',
    name: 'Gaming Desktop G7',
    category: 'desktop',
    status: 'selling',
    specSummary: 'Intel i7-14700K + RTX 5070 Ti',
    price: 58900,
    stock: 12,
    description: '',
    highlights: [],
    specs: {
      cpu: 'Intel Core i7-14700K',
      gpu: 'RTX 5070 Ti 16GB',
      mainboard: 'ASUS ROG STRIX B760-F',
      ram: '32GB DDR5 6000MHz',
      storage: '2TB NVMe SSD',
      psu: '850W 80+ Gold',
      case: 'Mid Tower ATX',
      cooling: '240mm AIO',
      os: 'Windows 11 Home',
      warranty: '2 Years',
    },
    updatedAt: '18/08/2025',
  },
  {
    id: '4',
    sku: 'MPC-M3-2026',
    name: 'Mini PC Compact M3',
    category: 'mini_pc',
    status: 'selling',
    specSummary: 'Intel i5-14500 + Integrated',
    price: 18900,
    stock: 8,
    description: '',
    highlights: [],
    specs: {
      cpu: 'Intel Core i5-14500',
      gpu: 'Intel UHD Graphics 770',
      mainboard: 'Mini-ITX OEM Board',
      ram: '16GB DDR5 5200MHz',
      storage: '1TB NVMe SSD',
      psu: '90W External Adapter',
      case: 'Mini-ITX Compact Case',
      cooling: 'Low-profile Stock Cooler',
      os: 'Windows 11 Home',
      warranty: '1 Year',
    },
    updatedAt: '17/08/2025',
  },
  {
    id: '5',
    sku: 'AIO-A5-2026',
    name: 'All-in-One Studio A5',
    category: 'all_in_one',
    status: 'out_of_stock',
    specSummary: 'AMD Ryzen 7 8700G + Integrated',
    price: 32500,
    stock: 0,
    description: '',
    highlights: [],
    specs: {
      cpu: 'AMD Ryzen 7 8700G',
      gpu: 'AMD Radeon 780M',
      mainboard: 'OEM All-in-One Board',
      ram: '16GB DDR5 5600MHz',
      storage: '512GB NVMe SSD',
      psu: '65W Internal PSU',
      case: '27" All-in-One Chassis',
      cooling: 'Stock Cooler',
      os: 'Windows 11 Home',
      warranty: '1 Year',
    },
    updatedAt: '15/08/2025',
  },
  {
    id: '6',
    sku: 'AIDL-DL2-2026',
    name: 'AI Deep Learning DL2',
    category: 'ai_workstation',
    status: 'selling',
    specSummary: 'AMD Ryzen 9 9950X + RTX 5080',
    price: 195000,
    stock: 5,
    description: '',
    highlights: [],
    specs: {
      cpu: 'AMD Ryzen 9 9950X',
      gpu: 'NVIDIA GeForce RTX 5080 16GB',
      mainboard: 'ASUS ProArt X870E-CREATOR',
      ram: '64GB DDR5 6000MHz',
      storage: '2TB NVMe SSD',
      psu: '1000W 80+ Platinum',
      case: 'Full Tower ATX',
      cooling: '360mm AIO',
      os: 'Ubuntu 24.04 LTS',
      warranty: '3 Years',
    },
    updatedAt: '14/08/2025',
  },
]

export function getDesktopPcSummary(): Promise<DesktopPcSummary> {
  return mockDelay({ total: 86, selling: 62, lowStock: 15, discontinued: 9 })
}

export function getDesktopPcs(): Promise<DesktopPc[]> {
  return mockDelay(products)
}

export function getDesktopPcDetail(id: string): Promise<DesktopPc | null> {
  return mockDelay(products.find((product) => product.id === id) ?? null)
}

export function saveDesktopPc(
  _id: string,
  _data: DesktopPcFormValues & { highlights: string[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createDesktopPc(
  _data: DesktopPcFormValues & { highlights: string[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(products.length + 1) })
}

export function deleteDesktopPc(_id: string): Promise<void> {
  return mockDelay(undefined)
}
