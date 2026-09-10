export type PcSetBrand = 'MAXCOM' | 'ASUS' | 'MSI' | 'Lenovo' | 'HP' | 'Acer';
export type PcSetCpuPlatform = 'Intel' | 'AMD';
export type PcSetBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface PcSetProduct {
  id: string;
  name: string;
  brand: PcSetBrand;
  cpuPlatform: PcSetCpuPlatform;
  usageType: string;
  cpu: string;
  gpu: string;
  ram: string;
  price: number;
  originalPrice: number;
  badge?: PcSetBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const pcSetProducts: PcSetProduct[] = [
  { id: 'set1', name: 'MAXCOM Gaming Set X7 Ryzen 7 RTX 4070', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Gaming', cpu: 'Ryzen 7 7800X3D', gpu: 'RTX 4070', ram: '32GB DDR5', price: 39900, originalPrice: 45900, badge: 'สินค้าขายดี', inStock: true },
  { id: 'set2', name: 'MAXCOM Creator Set Pro i7 RTX 4060 Ti', brand: 'MAXCOM', cpuPlatform: 'Intel', usageType: 'Creator', cpu: 'Core i7-14700K', gpu: 'RTX 4060 Ti', ram: '32GB DDR5', price: 37900, originalPrice: 42900, badge: 'แนะนำ', inStock: true },
  { id: 'set3', name: 'ASUS ROG Strix Promo Set G16CH', brand: 'ASUS', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i5-14400F', gpu: 'RTX 4060', ram: '16GB DDR5', price: 28900, originalPrice: 32900, inStock: true },
  { id: 'set4', name: 'MSI Codex R Promo Set', brand: 'MSI', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i5-13400F', gpu: 'RTX 4060', ram: '16GB DDR4', price: 26900, originalPrice: 29900, inStock: true },
  { id: 'set5', name: 'MAXCOM Office Set A5 Ryzen 5', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Office', cpu: 'Ryzen 5 5600G', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 10900, originalPrice: 12900, inStock: true },
  { id: 'set6', name: 'Lenovo ThinkCentre Promo Set Neo 50s', brand: 'Lenovo', cpuPlatform: 'Intel', usageType: 'Office', cpu: 'Core i5-13400', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 13900, originalPrice: 15900, inStock: true },
  { id: 'set7', name: 'HP Pavilion Promo Set TP01', brand: 'HP', cpuPlatform: 'AMD', usageType: 'Office', cpu: 'Ryzen 5 7500F', gpu: 'Integrated Graphics', ram: '16GB DDR5', price: 15900, originalPrice: 17900, inStock: true },
  { id: 'set8', name: 'MAXCOM Workstation Set W9 Ryzen 9', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Workstation', cpu: 'Ryzen 9 7950X', gpu: 'RTX 4080', ram: '64GB DDR5', price: 79900, originalPrice: 89900, badge: 'แนะนำ', inStock: true },
  { id: 'set9', name: 'Acer Predator Promo Set Orion 3000', brand: 'Acer', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i7-13700F', gpu: 'RTX 4070', ram: '16GB DDR5', price: 34900, originalPrice: 38900, badge: 'ใหม่', inStock: false },
  { id: 'set10', name: 'MAXCOM Budget Set B3 Ryzen 3', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Budget', cpu: 'Ryzen 3 4100', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 7490, originalPrice: 8900, inStock: true },
  { id: 'set11', name: 'ASUS ExpertCenter Promo Set D700', brand: 'ASUS', cpuPlatform: 'Intel', usageType: 'Office', cpu: 'Core i3-13100', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 11900, originalPrice: 13900, inStock: true },
  { id: 'set12', name: 'MSI MEG Aegis Promo Set Ti5', brand: 'MSI', cpuPlatform: 'Intel', usageType: 'Creator', cpu: 'Core i9-14900K', gpu: 'RTX 4090', ram: '64GB DDR5', price: 144900, originalPrice: 159900, inStock: true },
];

export type PcSetStockStatus = 'in' | 'preorder';

export interface PcSetFilterState {
  brands: PcSetBrand[];
  usageTypes: string[];
  cpuPlatforms: PcSetCpuPlatform[];
  stock: PcSetStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const PC_SET_PRICE_CEILING = 100000;

export const pcSetBrandOptions: PcSetBrand[] = ['MAXCOM', 'ASUS', 'MSI', 'Lenovo', 'HP', 'Acer'];

// "Usage Type" filter options — a superset of what the mock catalog actually
// has, matching the real filter list this is meant to mirror.
export const pcSetUsageTypeOptions = ['Gaming', 'Office', 'Creator', 'Workstation', 'Budget'];

export const pcSetCpuPlatformOptions: PcSetCpuPlatform[] = ['Intel', 'AMD'];

export const defaultPcSetFilters: PcSetFilterState = {
  brands: [],
  usageTypes: [],
  cpuPlatforms: [],
  stock: [],
  minPrice: 0,
  maxPrice: PC_SET_PRICE_CEILING,
};

export function applyPcSetFilters(products: PcSetProduct[], filters: PcSetFilterState): PcSetProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.usageTypes.length > 0 && !filters.usageTypes.includes(product.usageType)) return false;
    if (filters.cpuPlatforms.length > 0 && !filters.cpuPlatforms.includes(product.cpuPlatform)) return false;
    if (filters.stock.length > 0) {
      const status: PcSetStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
