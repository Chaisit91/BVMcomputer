export type CpuBrand = 'Intel' | 'AMD';
export type CpuSocket = 'AM4' | 'AM5' | 'sTR5' | 'LGA 1700' | 'LGA 1851';
export type CpuBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface CpuProduct {
  id: string;
  name: string;
  brand: CpuBrand;
  socket: CpuSocket;
  series: string;
  cores: number;
  threads: number;
  clock: string;
  price: number;
  badge?: CpuBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
  /** L2 cache, total across all cores (e.g. "28 MB"). */
  l2Cache: string;
  /** L3 cache, shared/total (e.g. "33 MB"). */
  l3Cache: string;
  /** Base (default) TDP, e.g. "125 W". */
  tdp: string;
  /** Max turbo / package power (Intel PL2, AMD PPT), e.g. "253 W". */
  maxTurboPower: string;
  /** Manufacturer warranty on the boxed retail unit. */
  warranty: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const cpuProducts: CpuProduct[] = [
  { id: 'cpu1', name: 'Intel Core i7-14700K', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i7', cores: 20, threads: 28, clock: '3.4 - 5.6 GHz', price: 14990, badge: 'สินค้าขายดี', inStock: true, l2Cache: '28 MB', l3Cache: '33 MB', tdp: '125 W', maxTurboPower: '253 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu2', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', socket: 'AM5', series: 'Ryzen 7', cores: 8, threads: 16, clock: '4.2 - 5.0 GHz', price: 16900, badge: 'แนะนำ', inStock: true, l2Cache: '8 MB', l3Cache: '96 MB', tdp: '120 W', maxTurboPower: '162 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu3', name: 'Intel Core i5-14600KF', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i5', cores: 14, threads: 20, clock: '3.5 - 5.3 GHz', price: 8990, inStock: true, l2Cache: '24 MB', l3Cache: '24 MB', tdp: '125 W', maxTurboPower: '181 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu4', name: 'AMD Ryzen 5 7600', brand: 'AMD', socket: 'AM5', series: 'Ryzen 5', cores: 6, threads: 12, clock: '3.8 - 5.1 GHz', price: 7590, inStock: true, l2Cache: '6 MB', l3Cache: '32 MB', tdp: '65 W', maxTurboPower: '88 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu5', name: 'AMD Ryzen 7 5700X', brand: 'AMD', socket: 'AM4', series: 'Ryzen 7', cores: 8, threads: 16, clock: '3.4 - 4.6 GHz', price: 5490, inStock: true, l2Cache: '4 MB', l3Cache: '32 MB', tdp: '65 W', maxTurboPower: '88 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu6', name: 'Intel Core i9-14900K', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i9', cores: 24, threads: 32, clock: '3.2 - 6.0 GHz', price: 22990, badge: 'แนะนำ', inStock: true, l2Cache: '32 MB', l3Cache: '36 MB', tdp: '125 W', maxTurboPower: '253 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu7', name: 'AMD Ryzen 9 7950X', brand: 'AMD', socket: 'AM5', series: 'Ryzen 9', cores: 16, threads: 32, clock: '4.5 - 5.7 GHz', price: 24990, inStock: false, l2Cache: '16 MB', l3Cache: '64 MB', tdp: '170 W', maxTurboPower: '230 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu8', name: 'Intel Core i5-12400F', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i5', cores: 6, threads: 12, clock: '2.5 - 4.4 GHz', price: 4390, inStock: true, l2Cache: '7.5 MB', l3Cache: '18 MB', tdp: '65 W', maxTurboPower: '117 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu9', name: 'Intel Core i3-12100F', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i3', cores: 4, threads: 8, clock: '3.3 - 4.3 GHz', price: 2990, inStock: true, l2Cache: '5 MB', l3Cache: '12 MB', tdp: '60 W', maxTurboPower: '89 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu10', name: 'AMD Ryzen 5 5500', brand: 'AMD', socket: 'AM4', series: 'Ryzen 5', cores: 6, threads: 12, clock: '3.6 - 4.2 GHz', price: 2690, inStock: true, l2Cache: '3 MB', l3Cache: '16 MB', tdp: '65 W', maxTurboPower: '88 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu11', name: 'AMD Ryzen 7 5800X3D', brand: 'AMD', socket: 'AM4', series: 'Ryzen 7', cores: 8, threads: 16, clock: '3.4 - 4.5 GHz', price: 10990, badge: 'ใหม่', inStock: false, l2Cache: '4 MB', l3Cache: '96 MB', tdp: '105 W', maxTurboPower: '142 W', warranty: 'รับประกันศูนย์ 3 ปี' },
  { id: 'cpu12', name: 'Intel Core i7-13700F', brand: 'Intel', socket: 'LGA 1700', series: 'CORE i7', cores: 16, threads: 24, clock: '2.1 - 5.2 GHz', price: 11900, inStock: true, l2Cache: '24 MB', l3Cache: '30 MB', tdp: '65 W', maxTurboPower: '219 W', warranty: 'รับประกันศูนย์ 3 ปี' },
];

export type CpuStockStatus = 'in' | 'preorder';

export interface CpuFilterState {
  brands: CpuBrand[];
  sockets: CpuSocket[];
  series: string[];
  stock: CpuStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const CPU_PRICE_CEILING = 30000;

// "Processor Number" filter options — a superset of what the mock catalog
// actually has (Threadripper PRO / Ultra aren't in the 12 mock items yet),
// matching the real filter list this is meant to mirror.
export const cpuSeriesOptions = [
  'CORE i3',
  'CORE i5',
  'CORE i7',
  'CORE i9',
  'Ryzen 5',
  'Ryzen 7',
  'Ryzen 9',
  'RYZEN THREADRIPPER PRO',
  'ULTRA 5',
  'ULTRA 7',
];

export const cpuSocketOptions: CpuSocket[] = ['AM4', 'AM5', 'sTR5', 'LGA 1700', 'LGA 1851'];

export const defaultCpuFilters: CpuFilterState = {
  brands: [],
  sockets: [],
  series: [],
  stock: [],
  minPrice: 0,
  maxPrice: CPU_PRICE_CEILING,
};

export function applyCpuFilters(products: CpuProduct[], filters: CpuFilterState): CpuProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.sockets.length > 0 && !filters.sockets.includes(product.socket)) return false;
    if (filters.series.length > 0 && !filters.series.includes(product.series)) return false;
    if (filters.stock.length > 0) {
      const status: CpuStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
