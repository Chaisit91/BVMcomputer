import type { StorageFormValues } from '../schemas/storage.schema'
import type { ExtraSpec, Storage, StorageSummary } from '../types/storage'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const storages: Storage[] = [
  { id: '1', sku: 'ST-001', name: 'SAMSUNG 990 PRO M.2 NVMe 1TB', brand: 'SAMSUNG', sellingPrice: 4590, promoEnabled: false, promoPrice: 0, stock: 28, status: 'active', specs: { type: 'SSD M.2 NVMe', capacity: '1 TB', interface: 'PCIe Gen 4.0 x4', formFactor: 'M.2 2280', sequentialRead: '7,450 MB/s', sequentialWrite: '6,900 MB/s', cacheMemory: '1GB LPDDR4', mtbf: '1.5 Million Hours', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '28/08/2025' },
  { id: '2', sku: 'ST-002', name: 'WD BLACK SN850X M.2 NVMe 2TB', brand: 'WD', sellingPrice: 7250, promoEnabled: true, promoPrice: 6890, stock: 14, status: 'active', specs: { type: 'SSD M.2 NVMe', capacity: '2 TB', interface: 'PCIe Gen 4.0 x4', formFactor: 'M.2 2280', sequentialRead: '7,300 MB/s', sequentialWrite: '6,600 MB/s', cacheMemory: '2GB LPDDR4', mtbf: '1.5 Million Hours', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '27/08/2025' },
  { id: '3', sku: 'ST-003', name: 'KINGSTON NV2 M.2 NVMe 1TB', brand: 'KINGSTON', sellingPrice: 3690, promoEnabled: false, promoPrice: 0, stock: 4, status: 'active', specs: { type: 'SSD M.2 NVMe', capacity: '1 TB', interface: 'PCIe Gen 4.0 x4', formFactor: 'M.2 2280', sequentialRead: '3,500 MB/s', sequentialWrite: '2,100 MB/s', cacheMemory: 'N/A', mtbf: '1 Million Hours', warranty: '3 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '20/08/2025' },
  { id: '4', sku: 'ST-004', name: 'SEAGATE BarraCuda 3.5" 2TB', brand: 'SEAGATE', sellingPrice: 1990, promoEnabled: false, promoPrice: 0, stock: 45, status: 'active', specs: { type: 'HDD Internal 3.5 inch', capacity: '2 TB', interface: 'SATA III', formFactor: '3.5 inch', sequentialRead: '220 MB/s', sequentialWrite: '220 MB/s', cacheMemory: '256MB', mtbf: '1 Million Hours', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '19/08/2025' },
  { id: '5', sku: 'ST-005', name: 'CRUCIAL P3 M.2 NVMe 512GB', brand: 'CRUCIAL', sellingPrice: 2450, promoEnabled: false, promoPrice: 0, stock: 0, status: 'active', specs: { type: 'SSD M.2 NVMe', capacity: '512 GB', interface: 'PCIe Gen 4.0 x4', formFactor: 'M.2 2280', sequentialRead: '3,500 MB/s', sequentialWrite: '3,000 MB/s', cacheMemory: 'N/A', mtbf: '1.5 Million Hours', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '15/08/2025' },
  { id: '6', sku: 'ST-006', name: 'WD Blue SATA 2.5" 1TB', brand: 'WD', sellingPrice: 2890, promoEnabled: false, promoPrice: 0, stock: 19, status: 'active', specs: { type: 'SSD SATA 2.5 inch', capacity: '1 TB', interface: 'SATA III', formFactor: '2.5 inch', sequentialRead: '560 MB/s', sequentialWrite: '530 MB/s', cacheMemory: 'N/A', mtbf: '1.75 Million Hours', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '13/08/2025' },
  { id: '7', sku: 'ST-007', name: 'TOSHIBA P300 3.5" 4TB', brand: 'TOSHIBA', sellingPrice: 4150, promoEnabled: false, promoPrice: 0, stock: 2, status: 'active', specs: { type: 'HDD Internal 3.5 inch', capacity: '4 TB', interface: 'SATA III', formFactor: '3.5 inch', sequentialRead: '180 MB/s', sequentialWrite: '180 MB/s', cacheMemory: '256MB', mtbf: '1 Million Hours', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '11/08/2025' },
  { id: '8', sku: 'ST-008', name: 'SANDISK Ultra SATA 2.5" 512GB', brand: 'SANDISK', sellingPrice: 1690, promoEnabled: false, promoPrice: 0, stock: 32, status: 'active', specs: { type: 'SSD SATA 2.5 inch', capacity: '512 GB', interface: 'SATA III', formFactor: '2.5 inch', sequentialRead: '550 MB/s', sequentialWrite: '525 MB/s', cacheMemory: 'N/A', mtbf: '1.5 Million Hours', warranty: '3 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '09/08/2025' },
]

export function getStorageSummary(): Promise<StorageSummary> {
  return mockDelay({ totalModels: 620, totalStock: 4128, lowStockCount: 18, outOfStockCount: 4 })
}

export function getStorages(): Promise<Storage[]> {
  return mockDelay(storages)
}

export function getStorageDetail(id: string): Promise<Storage | null> {
  return mockDelay(storages.find((item) => item.id === id) ?? null)
}

export function saveStorage(
  _id: string,
  _data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createStorage(
  _data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(storages.length + 1) })
}

export function deleteStorage(_id: string): Promise<void> {
  return mockDelay(undefined)
}
