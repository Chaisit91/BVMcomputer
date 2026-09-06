export type CpuBrand = 'Intel' | 'AMD';
export type CpuSocket = 'AM4' | 'AM5' | 'LGA1700' | 'LGA1200';
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
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const cpuProducts: CpuProduct[] = [
  { id: 'cpu1', name: 'Intel Core i7-14700K', brand: 'Intel', socket: 'LGA1700', series: 'Core i7', cores: 20, threads: 28, clock: '3.4 - 5.6 GHz', price: 14990, badge: 'สินค้าขายดี', inStock: true },
  { id: 'cpu2', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', socket: 'AM5', series: 'Ryzen 7', cores: 8, threads: 16, clock: '4.2 - 5.0 GHz', price: 16900, badge: 'แนะนำ', inStock: true },
  { id: 'cpu3', name: 'Intel Core i5-14600KF', brand: 'Intel', socket: 'LGA1700', series: 'Core i5', cores: 14, threads: 20, clock: '3.5 - 5.3 GHz', price: 8990, inStock: true },
  { id: 'cpu4', name: 'AMD Ryzen 5 7600', brand: 'AMD', socket: 'AM5', series: 'Ryzen 5', cores: 6, threads: 12, clock: '3.8 - 5.1 GHz', price: 7590, inStock: true },
  { id: 'cpu5', name: 'AMD Ryzen 7 5700X', brand: 'AMD', socket: 'AM4', series: 'Ryzen 7', cores: 8, threads: 16, clock: '3.4 - 4.6 GHz', price: 5490, inStock: true },
  { id: 'cpu6', name: 'Intel Core i9-14900K', brand: 'Intel', socket: 'LGA1700', series: 'Core i9', cores: 24, threads: 32, clock: '3.2 - 6.0 GHz', price: 22990, badge: 'แนะนำ', inStock: true },
  { id: 'cpu7', name: 'AMD Ryzen 9 7950X', brand: 'AMD', socket: 'AM5', series: 'Ryzen 9', cores: 16, threads: 32, clock: '4.5 - 5.7 GHz', price: 24990, inStock: false },
  { id: 'cpu8', name: 'Intel Core i5-12400F', brand: 'Intel', socket: 'LGA1700', series: 'Core i5', cores: 6, threads: 12, clock: '2.5 - 4.4 GHz', price: 4390, inStock: true },
  { id: 'cpu9', name: 'Intel Core i3-12100F', brand: 'Intel', socket: 'LGA1700', series: 'Core i3', cores: 4, threads: 8, clock: '3.3 - 4.3 GHz', price: 2990, inStock: true },
  { id: 'cpu10', name: 'AMD Ryzen 5 5500', brand: 'AMD', socket: 'AM4', series: 'Ryzen 5', cores: 6, threads: 12, clock: '3.6 - 4.2 GHz', price: 2690, inStock: true },
  { id: 'cpu11', name: 'AMD Ryzen 7 5800X3D', brand: 'AMD', socket: 'AM4', series: 'Ryzen 7', cores: 8, threads: 16, clock: '3.4 - 4.5 GHz', price: 10990, badge: 'ใหม่', inStock: false },
  { id: 'cpu12', name: 'Intel Core i7-13700F', brand: 'Intel', socket: 'LGA1700', series: 'Core i7', cores: 16, threads: 24, clock: '2.1 - 5.2 GHz', price: 11900, inStock: true },
];

export type CpuStockStatus = 'in' | 'preorder';

export interface CpuFilterState {
  brands: CpuBrand[];
  sockets: CpuSocket[];
  series: string[];
  processorSearch: string;
  stock: CpuStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const CPU_PRICE_CEILING = 30000;

export const cpuSeriesOptions = ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'];

export const defaultCpuFilters: CpuFilterState = {
  brands: [],
  sockets: [],
  series: [],
  processorSearch: '',
  stock: [],
  minPrice: 0,
  maxPrice: CPU_PRICE_CEILING,
};

export function applyCpuFilters(products: CpuProduct[], filters: CpuFilterState): CpuProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.sockets.length > 0 && !filters.sockets.includes(product.socket)) return false;
    if (filters.series.length > 0 && !filters.series.includes(product.series)) return false;
    if (filters.processorSearch.trim() && !product.name.toLowerCase().includes(filters.processorSearch.trim().toLowerCase())) {
      return false;
    }
    if (filters.stock.length > 0) {
      const status: CpuStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
