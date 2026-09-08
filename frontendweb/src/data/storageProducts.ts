export type StorageBrand = 'Samsung' | 'Western Digital' | 'Seagate' | 'Kingston' | 'Crucial' | 'ADATA';
export type StorageType = 'SSD M.2 NVMe' | 'SSD SATA' | 'HDD';
export type StorageBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface StorageProduct {
  id: string;
  name: string;
  brand: StorageBrand;
  type: StorageType;
  capacity: string;
  readSpeed: string;
  price: number;
  badge?: StorageBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const storageProducts: StorageProduct[] = [
  { id: 'st1', name: 'Samsung 990 PRO 1TB NVMe Gen4', brand: 'Samsung', type: 'SSD M.2 NVMe', capacity: '1TB', readSpeed: '7450 MB/s', price: 3290, badge: 'สินค้าขายดี', inStock: true },
  { id: 'st2', name: 'Western Digital Black SN850X 2TB NVMe Gen4', brand: 'Western Digital', type: 'SSD M.2 NVMe', capacity: '2TB', readSpeed: '7300 MB/s', price: 5990, badge: 'แนะนำ', inStock: true },
  { id: 'st3', name: 'Kingston NV2 500GB NVMe Gen4', brand: 'Kingston', type: 'SSD M.2 NVMe', capacity: '500GB', readSpeed: '3500 MB/s', price: 1090, inStock: true },
  { id: 'st4', name: 'Crucial MX500 1TB SATA', brand: 'Crucial', type: 'SSD SATA', capacity: '1TB', readSpeed: '560 MB/s', price: 1690, inStock: true },
  { id: 'st5', name: 'ADATA LEGEND 850 1TB NVMe Gen4', brand: 'ADATA', type: 'SSD M.2 NVMe', capacity: '1TB', readSpeed: '5000 MB/s', price: 2390, inStock: true },
  { id: 'st6', name: 'Seagate BarraCuda 2TB HDD 7200RPM', brand: 'Seagate', type: 'HDD', capacity: '2TB', readSpeed: '190 MB/s', price: 1690, inStock: true },
  { id: 'st7', name: 'Samsung 990 EVO Plus 2TB NVMe Gen4', brand: 'Samsung', type: 'SSD M.2 NVMe', capacity: '2TB', readSpeed: '7250 MB/s', price: 5490, badge: 'แนะนำ', inStock: true },
  { id: 'st8', name: 'Western Digital Blue 500GB SATA', brand: 'Western Digital', type: 'SSD SATA', capacity: '500GB', readSpeed: '560 MB/s', price: 990, inStock: true },
  { id: 'st9', name: 'Seagate IronWolf 4TB HDD NAS', brand: 'Seagate', type: 'HDD', capacity: '4TB', readSpeed: '210 MB/s', price: 4290, inStock: true },
  { id: 'st10', name: 'Kingston KC3000 1TB NVMe Gen4', brand: 'Kingston', type: 'SSD M.2 NVMe', capacity: '1TB', readSpeed: '7000 MB/s', price: 2990, badge: 'ใหม่', inStock: false },
  { id: 'st11', name: 'Crucial P3 Plus 2TB NVMe Gen4', brand: 'Crucial', type: 'SSD M.2 NVMe', capacity: '2TB', readSpeed: '5000 MB/s', price: 3990, inStock: true },
  { id: 'st12', name: 'ADATA SU650 240GB SATA', brand: 'ADATA', type: 'SSD SATA', capacity: '240GB', readSpeed: '520 MB/s', price: 590, inStock: true },
];

export type StorageStockStatus = 'in' | 'preorder';

export interface StorageFilterState {
  brands: StorageBrand[];
  capacities: string[];
  types: StorageType[];
  stock: StorageStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const STORAGE_PRICE_CEILING = 10000;

export const storageBrandOptions: StorageBrand[] = [
  'Samsung',
  'Western Digital',
  'Seagate',
  'Kingston',
  'Crucial',
  'ADATA',
];

// "Capacity" filter options — a superset of what the mock catalog actually
// has, matching the real filter list this is meant to mirror.
export const storageCapacityOptions = ['240GB', '500GB', '1TB', '2TB', '4TB', '8TB'];

export const storageTypeOptions: StorageType[] = ['SSD M.2 NVMe', 'SSD SATA', 'HDD'];

export const defaultStorageFilters: StorageFilterState = {
  brands: [],
  capacities: [],
  types: [],
  stock: [],
  minPrice: 0,
  maxPrice: STORAGE_PRICE_CEILING,
};

export function applyStorageFilters(products: StorageProduct[], filters: StorageFilterState): StorageProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.capacities.length > 0 && !filters.capacities.includes(product.capacity)) return false;
    if (filters.types.length > 0 && !filters.types.includes(product.type)) return false;
    if (filters.stock.length > 0) {
      const status: StorageStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
