import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { MotherboardFormValues } from '../schemas/motherboard.schema'
import type { Motherboard } from '../types/motherboard'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockMotherboards: Motherboard[] = [
  {
    id: 'mb-1', sku: 'MB-AS-B650M', name: 'ASUS TUF Gaming B650M-Plus WiFi', brand: 'ASUS',
    sellingPrice: 5990, costPrice: 4800, stock: 16, publishImmediately: true,
    specs: { cpuSupport: 'AMD Ryzen 7000 Series', socket: 'AM5', chipset: 'AMD B650', mainboardSupport: 'Micro-ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '128GB', maxMemorySpeed: '6400MHz', formFactor: 'Micro-ATX', m2Slots: '2x M.2 NVMe', pcieSlots: '1x PCIe 4.0 x16', usbPorts: 'USB-C x1, USB 3.2 x4', audio: 'Realtek ALC897', lan: '2.5G LAN', wifi: 'WiFi 6', bluetooth: 'Bluetooth 5.2', warranty: '3 ปี' },
    description: 'เมนบอร์ดสาย TUF ทนทาน รองรับ Ryzen 7000 พร้อม WiFi 6 ในตัว', updatedAt: '2026-08-12T10:00:00Z',
  },
  {
    id: 'mb-2', sku: 'MB-MS-Z790', name: 'MSI PRO Z790-P WiFi', brand: 'MSI',
    sellingPrice: 7490, costPrice: 6100, stock: 9, publishImmediately: true,
    specs: { cpuSupport: '13th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel Z790', mainboardSupport: 'ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '192GB', maxMemorySpeed: '7200MHz', formFactor: 'ATX', m2Slots: '4x M.2 NVMe', pcieSlots: '2x PCIe 4.0 x16', usbPorts: 'USB-C x2, USB 3.2 x6', audio: 'Realtek ALC1200', lan: '2.5G LAN', wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', warranty: '3 ปี' },
    description: 'รองรับ overclock เต็มรูปแบบ เหมาะกับซีพียู Intel รุ่นสูง', updatedAt: '2026-08-08T10:00:00Z',
  },
  {
    id: 'mb-3', sku: 'MB-GB-B760M', name: 'Gigabyte B760M Aorus Elite AX', brand: 'GIGABYTE',
    sellingPrice: 4990, costPrice: 3950, stock: 3, publishImmediately: true,
    specs: { cpuSupport: '14th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel B760', mainboardSupport: 'Micro-ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '128GB', maxMemorySpeed: '7600MHz', formFactor: 'Micro-ATX', m2Slots: '2x M.2 NVMe', pcieSlots: '1x PCIe 4.0 x16', usbPorts: 'USB-C x1, USB 3.2 x4', audio: 'Realtek ALC897', lan: '2.5G LAN', wifi: 'WiFi 6', bluetooth: 'Bluetooth 5.3', warranty: '3 ปี' },
    description: 'สเปคคุ้มราคา รองรับแรมเร็วสูงสุด 7600MHz', updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    id: 'mb-4', sku: 'MB-AR-A620M', name: 'ASRock A620M-HDV/M.2', brand: 'ASROCK',
    sellingPrice: 2490, costPrice: 1950, stock: 22, publishImmediately: true,
    specs: { cpuSupport: 'AMD Ryzen 8000 Series', socket: 'AM5', chipset: 'AMD A620A', mainboardSupport: 'Micro-ATX', memorySlots: '2x DIMM', memoryType: 'DDR5', maxMemory: '64GB', maxMemorySpeed: '5600MHz', formFactor: 'Micro-ATX', m2Slots: '1x M.2 NVMe', pcieSlots: '1x PCIe 4.0 x16', usbPorts: 'USB 3.2 x2', audio: 'Realtek ALC897', lan: '1G LAN', wifi: 'ไม่มี', bluetooth: 'ไม่มี', warranty: '2 ปี' },
    description: 'เมนบอร์ดเริ่มต้นสาย AM5 ราคาประหยัด', updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'mb-5', sku: 'MB-MS-X870', name: 'MSI MAG X870 Tomahawk WiFi', brand: 'MSI',
    sellingPrice: 10990, costPrice: 9200, stock: 0, publishImmediately: false,
    specs: { cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD X870', mainboardSupport: 'ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '256GB', maxMemorySpeed: '8000MHz', formFactor: 'ATX', m2Slots: '4x M.2 NVMe', pcieSlots: '2x PCIe 5.0 x16', usbPorts: 'USB-C x2, USB 3.2 x6', audio: 'Realtek ALC4080', lan: '5G LAN', wifi: 'WiFi 7', bluetooth: 'Bluetooth 5.4', warranty: '3 ปี' },
    description: 'เรือธงรองรับ Ryzen 9000 พร้อม PCIe 5.0 เต็มรูปแบบ (สินค้าหมด รอสต็อกใหม่)', updatedAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'mb-6', sku: 'MB-CF-Z890', name: 'Colorful CVN Z890 Gaming Frozen', brand: 'COLORFUL',
    sellingPrice: 8990, costPrice: 7400, stock: 5, publishImmediately: true,
    specs: { cpuSupport: 'Intel Core Ultra', socket: 'LGA 1851', chipset: 'Intel Z890', mainboardSupport: 'ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '192GB', maxMemorySpeed: '8600MHz', formFactor: 'ATX', m2Slots: '4x M.2 NVMe', pcieSlots: '2x PCIe 5.0 x16', usbPorts: 'USB-C x2, USB 3.2 x6', audio: 'Realtek ALC4080', lan: '2.5G LAN', wifi: 'WiFi 7', bluetooth: 'Bluetooth 5.4', warranty: '3 ปี' },
    description: 'รองรับซีพียู Intel Core Ultra รุ่นใหม่ล่าสุด', updatedAt: '2026-06-28T10:00:00Z',
  },
  {
    id: 'mb-7', sku: 'MB-AS-B850M', name: 'ASUS Prime B850M-A WiFi', brand: 'ASUS',
    sellingPrice: 5490, costPrice: 4400, stock: 12, publishImmediately: true,
    specs: { cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD B850', mainboardSupport: 'Micro-ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '128GB', maxMemorySpeed: '7200MHz', formFactor: 'Micro-ATX', m2Slots: '3x M.2 NVMe', pcieSlots: '1x PCIe 5.0 x16', usbPorts: 'USB-C x1, USB 3.2 x4', audio: 'Realtek ALC897', lan: '2.5G LAN', wifi: 'WiFi 6E', bluetooth: 'Bluetooth 5.3', warranty: '3 ปี' },
    description: 'รุ่น Prime ราคาสมเหตุสมผล เสถียรสำหรับใช้งานทั่วไป', updatedAt: '2026-06-18T10:00:00Z',
  },
  {
    id: 'mb-8', sku: 'MB-GB-H610M', name: 'Gigabyte H610M H DDR4', brand: 'GIGABYTE',
    sellingPrice: 1990, costPrice: 1550, stock: 30, publishImmediately: true,
    specs: { cpuSupport: '12th Gen Intel Core', socket: 'LGA 1700', chipset: 'Intel H610', mainboardSupport: 'Micro-ATX', memorySlots: '2x DIMM', memoryType: 'DDR4', maxMemory: '64GB', maxMemorySpeed: '3200MHz', formFactor: 'Micro-ATX', m2Slots: '1x M.2 NVMe', pcieSlots: '1x PCIe 3.0 x16', usbPorts: 'USB 3.2 x2', audio: 'Realtek ALC897', lan: '1G LAN', wifi: 'ไม่มี', bluetooth: 'ไม่มี', warranty: '2 ปี' },
    description: 'เมนบอร์ดพื้นฐาน DDR4 ราคาประหยัดสุด เหมาะกับเครื่องออฟฟิศ', updatedAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'mb-9', sku: 'MB-AR-B840', name: 'ASRock B840M-HDV', brand: 'ASROCK',
    sellingPrice: 2190, costPrice: 1700, stock: 18, publishImmediately: true,
    specs: { cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD B840', mainboardSupport: 'Micro-ATX', memorySlots: '2x DIMM', memoryType: 'DDR5', maxMemory: '64GB', maxMemorySpeed: '5600MHz', formFactor: 'Micro-ATX', m2Slots: '1x M.2 NVMe', pcieSlots: '1x PCIe 4.0 x16', usbPorts: 'USB 3.2 x2', audio: 'Realtek ALC897', lan: '1G LAN', wifi: 'ไม่มี', bluetooth: 'ไม่มี', warranty: '2 ปี' },
    description: 'ตัวเลือกประหยัดสำหรับแพลตฟอร์ม AM5', updatedAt: '2026-05-22T10:00:00Z',
  },
  {
    id: 'mb-10', sku: 'MB-CFR-B650', name: 'Colorfire B650M Pulse (รุ่นเดิม)', brand: 'COLORFIRE',
    sellingPrice: 3490, costPrice: 2800, stock: 6, publishImmediately: false,
    specs: { cpuSupport: 'AMD Ryzen 7000 Series', socket: 'AM5', chipset: 'AMD B650', mainboardSupport: 'Micro-ATX', memorySlots: '4x DIMM', memoryType: 'DDR5', maxMemory: '128GB', maxMemorySpeed: '6000MHz', formFactor: 'Micro-ATX', m2Slots: '2x M.2 NVMe', pcieSlots: '1x PCIe 4.0 x16', usbPorts: 'USB-C x1, USB 3.2 x2', audio: 'Realtek ALC897', lan: '1G LAN', wifi: 'ไม่มี', bluetooth: 'ไม่มี', warranty: '2 ปี' },
    description: 'รุ่นเก่า ยังไม่เผยแพร่หน้าร้านออนไลน์', updatedAt: '2026-04-15T10:00:00Z',
  },
]

// Prisma's Decimal fields (sellingPrice/costPrice) serialize to JSON as
// strings, not numbers — coerce here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Motherboard {
  return { ...row, sellingPrice: Number(row.sellingPrice), costPrice: Number(row.costPrice) }
}

export function getMotherboards(): Promise<Motherboard[]> {
  if (USE_MOCK_DATA) return mockDelay(mockMotherboards)
  return api.get<Motherboard[]>('/motherboards').then((res) => res.data.map(fromApi))
}

export function getMotherboardDetail(id: string): Promise<Motherboard | null> {
  if (USE_MOCK_DATA) return mockDelay(mockMotherboards.find((m) => m.id === id) ?? null)
  return api
    .get<Motherboard>(`/motherboards/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveMotherboard(id: string, data: MotherboardFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/motherboards/${id}`, data).then(() => undefined)
}

export function createMotherboard(data: MotherboardFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mb-${Date.now()}` })
  return api.post<Motherboard>('/motherboards', data).then((res) => ({ id: res.data.id }))
}

export function deleteMotherboard(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/motherboards/${id}`).then(() => undefined)
}
