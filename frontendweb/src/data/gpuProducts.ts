export type GpuBrand = 'NVIDIA' | 'AMD';
export type GpuVram = '6GB' | '8GB' | '12GB' | '16GB' | '24GB';
export type GpuBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface GpuProduct {
  id: string;
  name: string;
  brand: GpuBrand;
  vram: GpuVram;
  series: string;
  memoryType: string;
  boostClock: string;
  price: number;
  badge?: GpuBadge;
  inStock: boolean;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const gpuProducts: GpuProduct[] = [
  { id: 'gpu1', name: 'NVIDIA GeForce RTX 4070', brand: 'NVIDIA', vram: '12GB', series: 'RTX 40', memoryType: 'GDDR6X', boostClock: '2.48 GHz', price: 21900, badge: 'สินค้าขายดี', inStock: true },
  { id: 'gpu2', name: 'AMD Radeon RX 7800 XT', brand: 'AMD', vram: '16GB', series: 'RX 7000', memoryType: 'GDDR6', boostClock: '2.43 GHz', price: 19900, badge: 'แนะนำ', inStock: true },
  { id: 'gpu3', name: 'NVIDIA GeForce RTX 4060 Ti', brand: 'NVIDIA', vram: '8GB', series: 'RTX 40', memoryType: 'GDDR6', boostClock: '2.54 GHz', price: 14900, inStock: true },
  { id: 'gpu4', name: 'AMD Radeon RX 7600', brand: 'AMD', vram: '8GB', series: 'RX 7000', memoryType: 'GDDR6', boostClock: '2.66 GHz', price: 9990, inStock: true },
  { id: 'gpu5', name: 'NVIDIA GeForce RTX 3060', brand: 'NVIDIA', vram: '12GB', series: 'RTX 30', memoryType: 'GDDR6', boostClock: '1.78 GHz', price: 8990, inStock: true },
  { id: 'gpu6', name: 'NVIDIA GeForce RTX 4090', brand: 'NVIDIA', vram: '24GB', series: 'RTX 40', memoryType: 'GDDR6X', boostClock: '2.52 GHz', price: 62900, badge: 'แนะนำ', inStock: true },
  { id: 'gpu7', name: 'AMD Radeon RX 7900 XTX', brand: 'AMD', vram: '24GB', series: 'RX 7000', memoryType: 'GDDR6', boostClock: '2.5 GHz', price: 42900, inStock: false },
  { id: 'gpu8', name: 'NVIDIA GeForce RTX 3050', brand: 'NVIDIA', vram: '8GB', series: 'RTX 30', memoryType: 'GDDR6', boostClock: '1.78 GHz', price: 6490, inStock: true },
  { id: 'gpu9', name: 'AMD Radeon RX 6600', brand: 'AMD', vram: '8GB', series: 'RX 6000', memoryType: 'GDDR6', boostClock: '2.49 GHz', price: 6990, inStock: true },
  { id: 'gpu10', name: 'NVIDIA GeForce RTX 4070 Ti Super', brand: 'NVIDIA', vram: '16GB', series: 'RTX 40', memoryType: 'GDDR6X', boostClock: '2.61 GHz', price: 32900, inStock: true },
  { id: 'gpu11', name: 'AMD Radeon RX 6700 XT', brand: 'AMD', vram: '12GB', series: 'RX 6000', memoryType: 'GDDR6', boostClock: '2.58 GHz', price: 12900, badge: 'ใหม่', inStock: false },
  { id: 'gpu12', name: 'NVIDIA GeForce RTX 4080 Super', brand: 'NVIDIA', vram: '16GB', series: 'RTX 40', memoryType: 'GDDR6X', boostClock: '2.55 GHz', price: 44900, inStock: true },
];

export type GpuStockStatus = 'in' | 'preorder';

export interface GpuFilterState {
  brands: GpuBrand[];
  vrams: GpuVram[];
  series: string[];
  modelSearch: string;
  stock: GpuStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const GPU_PRICE_CEILING = 70000;

export const gpuSeriesOptions = ['RTX 40', 'RTX 30', 'RX 7000', 'RX 6000'];

export const gpuVramOptions: GpuVram[] = ['6GB', '8GB', '12GB', '16GB', '24GB'];

export const defaultGpuFilters: GpuFilterState = {
  brands: [],
  vrams: [],
  series: [],
  modelSearch: '',
  stock: [],
  minPrice: 0,
  maxPrice: GPU_PRICE_CEILING,
};

export function applyGpuFilters(products: GpuProduct[], filters: GpuFilterState): GpuProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.vrams.length > 0 && !filters.vrams.includes(product.vram)) return false;
    if (filters.series.length > 0 && !filters.series.includes(product.series)) return false;
    if (filters.modelSearch.trim() && !product.name.toLowerCase().includes(filters.modelSearch.trim().toLowerCase())) {
      return false;
    }
    if (filters.stock.length > 0) {
      const status: GpuStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
