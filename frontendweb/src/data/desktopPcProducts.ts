export type DesktopPcBrand = 'MAXCOM' | 'ASUS' | 'MSI' | 'Lenovo' | 'HP' | 'Acer';
export type DesktopPcCpuPlatform = 'Intel' | 'AMD';
export type DesktopPcBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface DesktopPcProduct {
  id: string;
  name: string;
  brand: DesktopPcBrand;
  cpuPlatform: DesktopPcCpuPlatform;
  usageType: string;
  cpu: string;
  gpu: string;
  ram: string;
  price: number;
  badge?: DesktopPcBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const desktopPcProducts: DesktopPcProduct[] = [
  { id: 'pc1', name: 'MAXCOM Gaming X7 Ryzen 7 RTX 4070', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Gaming', cpu: 'Ryzen 7 7800X3D', gpu: 'RTX 4070', ram: '32GB DDR5', price: 45900, badge: 'สินค้าขายดี', inStock: true },
  { id: 'pc2', name: 'MAXCOM Creator Pro i7 RTX 4060 Ti', brand: 'MAXCOM', cpuPlatform: 'Intel', usageType: 'Creator', cpu: 'Core i7-14700K', gpu: 'RTX 4060 Ti', ram: '32GB DDR5', price: 42900, badge: 'แนะนำ', inStock: true },
  { id: 'pc3', name: 'ASUS ROG Strix G16CH Gaming Desktop', brand: 'ASUS', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i5-14400F', gpu: 'RTX 4060', ram: '16GB DDR5', price: 32900, inStock: true },
  { id: 'pc4', name: 'MSI Codex R Gaming Desktop', brand: 'MSI', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i5-13400F', gpu: 'RTX 4060', ram: '16GB DDR4', price: 29900, inStock: true },
  { id: 'pc5', name: 'MAXCOM Office A5 Ryzen 5', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Office', cpu: 'Ryzen 5 5600G', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 12900, inStock: true },
  { id: 'pc6', name: 'Lenovo ThinkCentre Neo 50s', brand: 'Lenovo', cpuPlatform: 'Intel', usageType: 'Office', cpu: 'Core i5-13400', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 15900, inStock: true },
  { id: 'pc7', name: 'HP Pavilion Desktop TP01', brand: 'HP', cpuPlatform: 'AMD', usageType: 'Office', cpu: 'Ryzen 5 7500F', gpu: 'Integrated Graphics', ram: '16GB DDR5', price: 17900, inStock: true },
  { id: 'pc8', name: 'MAXCOM Workstation W9 Ryzen 9', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Workstation', cpu: 'Ryzen 9 7950X', gpu: 'RTX 4080', ram: '64GB DDR5', price: 89900, badge: 'แนะนำ', inStock: true },
  { id: 'pc9', name: 'Acer Predator Orion 3000', brand: 'Acer', cpuPlatform: 'Intel', usageType: 'Gaming', cpu: 'Core i7-13700F', gpu: 'RTX 4070', ram: '16GB DDR5', price: 38900, badge: 'ใหม่', inStock: false },
  { id: 'pc10', name: 'MAXCOM Budget B3 Ryzen 3', brand: 'MAXCOM', cpuPlatform: 'AMD', usageType: 'Budget', cpu: 'Ryzen 3 4100', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 8900, inStock: true },
  { id: 'pc11', name: 'ASUS ExpertCenter D700', brand: 'ASUS', cpuPlatform: 'Intel', usageType: 'Office', cpu: 'Core i3-13100', gpu: 'Integrated Graphics', ram: '8GB DDR4', price: 13900, inStock: true },
  { id: 'pc12', name: 'MSI MEG Aegis Ti5 Extreme', brand: 'MSI', cpuPlatform: 'Intel', usageType: 'Creator', cpu: 'Core i9-14900K', gpu: 'RTX 4090', ram: '64GB DDR5', price: 159900, inStock: true },
];

export type DesktopPcStockStatus = 'in' | 'preorder';

export interface DesktopPcFilterState {
  brands: DesktopPcBrand[];
  usageTypes: string[];
  cpuPlatforms: DesktopPcCpuPlatform[];
  stock: DesktopPcStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const DESKTOP_PC_PRICE_CEILING = 100000;

export const desktopPcBrandOptions: DesktopPcBrand[] = ['MAXCOM', 'ASUS', 'MSI', 'Lenovo', 'HP', 'Acer'];

// "Usage Type" filter options — a superset of what the mock catalog actually
// has, matching the real filter list this is meant to mirror.
export const desktopPcUsageTypeOptions = ['Gaming', 'Office', 'Creator', 'Workstation', 'Budget'];

export const desktopPcCpuPlatformOptions: DesktopPcCpuPlatform[] = ['Intel', 'AMD'];

export const defaultDesktopPcFilters: DesktopPcFilterState = {
  brands: [],
  usageTypes: [],
  cpuPlatforms: [],
  stock: [],
  minPrice: 0,
  maxPrice: DESKTOP_PC_PRICE_CEILING,
};

export function applyDesktopPcFilters(
  products: DesktopPcProduct[],
  filters: DesktopPcFilterState,
): DesktopPcProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.usageTypes.length > 0 && !filters.usageTypes.includes(product.usageType)) return false;
    if (filters.cpuPlatforms.length > 0 && !filters.cpuPlatforms.includes(product.cpuPlatform)) return false;
    if (filters.stock.length > 0) {
      const status: DesktopPcStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
