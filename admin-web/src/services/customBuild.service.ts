import type { CustomBuildCreateFormValues, CustomBuildEditFormValues } from '../schemas/customBuild.schema'
import type { CustomBuildDetail, CustomBuildOrder, CustomBuildSummary } from '../types/customBuild'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const orders: CustomBuildOrder[] = [
  { id: '1', orderNo: 'ORD-2025-0001', customer: 'สมชาย ใจดี', date: '15/08/2025', cpu: 'Intel Core i7-14700K', gpu: 'RTX 5070 Ti', motherboard: 'ASUS ROG STRIX B760', ram: '32GB DDR5', storage: 'Samsung 990 Pro 1TB', psu: 'Corsair RM850x', case: 'NZXT H7 Flow', cooling: 'Thermalright Peerless', total: 58900, status: 'done' },
  { id: '2', orderNo: 'ORD-2025-0002', customer: 'วิภา แสงทอง', date: '18/08/2025', cpu: 'AMD Ryzen 7 7800X3D', gpu: 'RTX 5060 Ti', motherboard: 'MSI MAG B650', ram: '16GB DDR5', storage: 'WD Black SN770 512GB', psu: 'Seasonic Focus GX', case: 'Corsair 4000D', cooling: 'ID-Cooling SE-224', total: 42500, status: 'pending' },
  { id: '3', orderNo: 'ORD-2025-0003', customer: 'ณัฐพล สุขใจ', date: '20/08/2025', cpu: 'Intel Core i5-14400F', gpu: 'RX 9070', motherboard: 'Gigabyte B760M', ram: '16GB DDR5', storage: 'Kingston NV2 1TB', psu: 'be quiet! Pure Power', case: 'Thermaltake S100', cooling: 'Stock Cooler', total: 32800, status: 'done' },
  { id: '4', orderNo: 'ORD-2025-0004', customer: 'ปริญญา ศรีสุข', date: '21/08/2025', cpu: 'AMD Ryzen 9 9900X', gpu: 'RTX 5080', motherboard: 'ASUS TUF X670E', ram: '64GB DDR5', storage: 'Samsung 990 Pro 2TB', psu: 'Corsair HX1200', case: 'Lian Li O11D', cooling: 'NZXT Kraken X63', total: 89500, status: 'pending' },
  { id: '5', orderNo: 'ORD-2025-0005', customer: 'มานะ พยัคฆ์เดช', date: '22/08/2025', cpu: 'Intel Core i9-14900K', gpu: 'RTX 5090', motherboard: 'MSI MEG Z790 ACE', ram: '64GB DDR5', storage: 'WD Black SN850X 2TB', psu: 'Seasonic Prime TX', case: 'be quiet! Dark Base', cooling: 'Corsair H150i', total: 125000, status: 'in_progress' },
  { id: '6', orderNo: 'ORD-2025-0006', customer: 'สุมิตรา วงศ์ดี', date: '23/08/2025', cpu: 'AMD Ryzen 5 7600', gpu: 'RX 7600', motherboard: 'ASRock B650M', ram: '16GB DDR5', storage: 'Crucial P3 500GB', psu: 'EVGA 550W', case: 'Cougar MX330', cooling: 'Stock Cooler', total: 22400, status: 'cancelled' },
]

export function getCustomBuildSummary(): Promise<CustomBuildSummary> {
  return mockDelay({ total: 156, pending: 23, done: 118, cancelled: 15 })
}

export function getCustomBuildOrders(): Promise<CustomBuildOrder[]> {
  return mockDelay(orders)
}

const details: CustomBuildDetail[] = [
  {
    id: '1',
    orderNo: 'ORD-2025-0001',
    customer: 'สมชาย ใจดี',
    status: 'done',
    components: {
      cpu: 'Intel Core i7-14700K',
      gpu: 'INNO3D GeForce RTX 5070 Ti',
      motherboard: 'ASUS ROG STRIX B760-F',
      ram: 'Corsair Vengeance 32GB DDR5-5600',
      storage: 'Samsung 990 Pro 1TB NVMe',
      psu: 'Corsair RM850x 850W 80+ Gold',
      case: 'NZXT H7 Flow',
      cooling: 'Thermalright Peerless Assassin 120',
    },
    prices: { cpu: 12900, gpu: 19500, motherboard: 7990, ram: 4290, storage: 4590, psu: 4990, case: 3290, cooling: 1350 },
    notes: 'ลูกค้าต้องการประกอบเครื่องภายในวันที่ 20/08/2025 — ต้องการ Windows 11 Pro ติดตั้งให้ด้วย',
  },
  {
    id: '2',
    orderNo: 'ORD-2025-0002',
    customer: 'วิภา แสงทอง',
    status: 'pending',
    components: {
      cpu: 'AMD Ryzen 7 7800X3D',
      gpu: 'RTX 5060 Ti',
      motherboard: 'MSI MAG B650',
      ram: '16GB DDR5',
      storage: 'WD Black SN770 512GB',
      psu: 'Seasonic Focus GX',
      case: 'Corsair 4000D',
      cooling: 'ID-Cooling SE-224',
    },
    prices: { cpu: 11900, gpu: 16900, motherboard: 6490, ram: 2290, storage: 1690, psu: 2990, case: 2790, cooling: 890 },
    notes: '',
  },
  {
    id: '3',
    orderNo: 'ORD-2025-0003',
    customer: 'ณัฐพล สุขใจ',
    status: 'done',
    components: {
      cpu: 'Intel Core i5-14400F',
      gpu: 'RX 9070',
      motherboard: 'Gigabyte B760M',
      ram: '16GB DDR5',
      storage: 'Kingston NV2 1TB',
      psu: 'be quiet! Pure Power',
      case: 'Thermaltake S100',
      cooling: 'Stock Cooler',
    },
    prices: { cpu: 6990, gpu: 16900, motherboard: 3990, ram: 2190, storage: 1990, psu: 2490, case: 1890, cooling: 0 },
    notes: '',
  },
  {
    id: '4',
    orderNo: 'ORD-2025-0004',
    customer: 'ปริญญา ศรีสุข',
    status: 'pending',
    components: {
      cpu: 'AMD Ryzen 9 9900X',
      gpu: 'RTX 5080',
      motherboard: 'ASUS TUF X670E',
      ram: '64GB DDR5',
      storage: 'Samsung 990 Pro 2TB',
      psu: 'Corsair HX1200',
      case: 'Lian Li O11D',
      cooling: 'NZXT Kraken X63',
    },
    prices: { cpu: 15900, gpu: 34900, motherboard: 12900, ram: 8990, storage: 7990, psu: 6990, case: 5990, cooling: 4990 },
    notes: '',
  },
  {
    id: '5',
    orderNo: 'ORD-2025-0005',
    customer: 'มานะ พยัคฆ์เดช',
    status: 'in_progress',
    components: {
      cpu: 'Intel Core i9-14900K',
      gpu: 'RTX 5090',
      motherboard: 'MSI MEG Z790 ACE',
      ram: '64GB DDR5',
      storage: 'WD Black SN850X 2TB',
      psu: 'Seasonic Prime TX',
      case: 'be quiet! Dark Base',
      cooling: 'Corsair H150i',
    },
    prices: { cpu: 21900, gpu: 62900, motherboard: 15900, ram: 8990, storage: 7990, psu: 9990, case: 8990, cooling: 5990 },
    notes: '',
  },
  {
    id: '6',
    orderNo: 'ORD-2025-0006',
    customer: 'สุมิตรา วงศ์ดี',
    status: 'cancelled',
    components: {
      cpu: 'AMD Ryzen 5 7600',
      gpu: 'RX 7600',
      motherboard: 'ASRock B650M',
      ram: '16GB DDR5',
      storage: 'Crucial P3 500GB',
      psu: 'EVGA 550W',
      case: 'Cougar MX330',
      cooling: 'Stock Cooler',
    },
    prices: { cpu: 7490, gpu: 9990, motherboard: 3490, ram: 1990, storage: 1290, psu: 1490, case: 990, cooling: 0 },
    notes: '',
  },
]

export function getCustomBuildDetail(id: string): Promise<CustomBuildDetail | null> {
  return mockDelay(details.find((detail) => detail.id === id) ?? null)
}

export function saveCustomBuildDetail(_id: string, _data: CustomBuildEditFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createCustomBuildOrder(_data: CustomBuildCreateFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(details.length + 1) })
}
