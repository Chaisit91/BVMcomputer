export type GpuBrand =
  | 'ASROCK'
  | 'ASUS'
  | 'COLORFUL'
  | 'GALAX'
  | 'GIGABYTE'
  | 'INNO3D'
  | 'LEADTEK'
  | 'MSI'
  | 'PALIT'
  | 'POWER COLOR'
  | 'SAPPHIRE'
  | 'XFX'
  | 'ZOTAC'
  | 'COLORFIRE';

export type GpuBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface GpuProduct {
  id: string;
  name: string;
  brand: GpuBrand;
  series: string;
  model: string;
  memorySize: string;
  power: string;
  boostClock: string;
  price: number;
  badge?: GpuBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const gpuProducts: GpuProduct[] = [
  { id: 'gpu1', name: 'ZOTAC GAMING GeForce RTX 5070 Ti', brand: 'ZOTAC', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5070 Ti', memorySize: '16GB GDDR7', power: '750 Watt', boostClock: '2.60 GHz', price: 35900, badge: 'สินค้าขายดี', inStock: true },
  { id: 'gpu2', name: 'ASUS TUF Gaming Radeon RX 9070 XT', brand: 'ASUS', series: 'AMD Radeon™ RX 9000 Series', model: 'Radeon™ RX 9070 XT', memorySize: '16GB GDDR6', power: '750 Watt', boostClock: '2.97 GHz', price: 28900, badge: 'แนะนำ', inStock: true },
  { id: 'gpu3', name: 'MSI GAMING GeForce RTX 5060', brand: 'MSI', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5060', memorySize: '8GB GDDR7', power: '550 Watt', boostClock: '2.50 GHz', price: 13900, inStock: true },
  { id: 'gpu4', name: 'GIGABYTE GeForce RTX 5050', brand: 'GIGABYTE', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5050', memorySize: '8GB GDDR6', power: '450 Watt', boostClock: '2.57 GHz', price: 8990, inStock: true },
  { id: 'gpu5', name: 'SAPPHIRE PULSE Radeon RX 9070', brand: 'SAPPHIRE', series: 'AMD Radeon™ RX 9000 Series', model: 'Radeon™ RX 9070', memorySize: '16GB GDDR6', power: '650 Watt', boostClock: '2.54 GHz', price: 24900, inStock: true },
  { id: 'gpu6', name: 'PALIT GameRock GeForce RTX 5090', brand: 'PALIT', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5090', memorySize: '32GB GDDR7', power: '1000 Watt', boostClock: '2.41 GHz', price: 74900, badge: 'แนะนำ', inStock: true },
  { id: 'gpu7', name: 'GALAX GeForce RTX 5080', brand: 'GALAX', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5080', memorySize: '16GB GDDR7', power: '800 Watt', boostClock: '2.62 GHz', price: 47900, inStock: false },
  { id: 'gpu8', name: 'XFX SWFT Radeon RX 9060 XT', brand: 'XFX', series: 'AMD Radeon™ RX 9000 Series', model: 'Radeon™ RX 9060 XT', memorySize: '16GB GDDR6', power: '550 Watt', boostClock: '3.13 GHz', price: 14900, inStock: true },
  { id: 'gpu9', name: 'ASROCK Challenger Radeon RX 7600', brand: 'ASROCK', series: 'AMD Radeon™ RX 7000 Series', model: 'Radeon™ RX 7600', memorySize: '8GB GDDR6', power: '450 Watt', boostClock: '2.66 GHz', price: 9990, inStock: true },
  { id: 'gpu10', name: 'ZOTAC GAMING GeForce RTX 3050', brand: 'ZOTAC', series: 'GeForce RTX™ 30 Series', model: 'GeForce RTX 3050', memorySize: '6GB GDDR6', power: '300 Watt', boostClock: '1.78 GHz', price: 6490, inStock: true },
  { id: 'gpu11', name: 'INNO3D GeForce RTX 5060 Ti', brand: 'INNO3D', series: 'NVIDIA GeForce RTX™ 50 Series', model: 'GeForce® RTX 5060 Ti', memorySize: '16GB GDDR7', power: '600 Watt', boostClock: '2.57 GHz', price: 18900, badge: 'ใหม่', inStock: false },
  { id: 'gpu12', name: 'LEADTEK RTX PRO 4000 Blackwell', brand: 'LEADTEK', series: 'NVIDIA RTX PRO™ Series', model: 'RTX PRO™ 4000 Blackwell', memorySize: '24GB GDDR7', power: '350 Watt', boostClock: '2.58 GHz', price: 52900, inStock: true },
];

export type GpuStockStatus = 'in' | 'preorder';

export interface GpuFilterState {
  brands: GpuBrand[];
  series: string[];
  models: string[];
  memorySizes: string[];
  powers: string[];
  stock: GpuStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const GPU_PRICE_CEILING = 80000;

export const gpuBrandOptions: GpuBrand[] = [
  'ASROCK',
  'ASUS',
  'COLORFUL',
  'GALAX',
  'GIGABYTE',
  'INNO3D',
  'LEADTEK',
  'MSI',
  'PALIT',
  'POWER COLOR',
  'SAPPHIRE',
  'XFX',
  'ZOTAC',
  'COLORFIRE',
];

export const gpuSeriesOptions = [
  'GeForce RTX™ 30 Series',
  'AMD Radeon™ RX 7000 Series',
  'NVIDIA GeForce RTX™ 30 Series',
  'NVIDIA GeForce RTX™ 50 Series',
  'AMD Radeon™ RX 9000 Series',
  'NVIDIA RTX PRO™ Series',
];

export const gpuModelOptions = [
  'GeForce RTX 3050',
  'Radeon™ RX 7600',
  'GeForce® RTX 5080',
  'GeForce® RTX 5090',
  'GeForce® RTX 5070 Ti',
  'GeForce® RTX 5070',
  'Radeon™ RX 9070',
  'Radeon™ RX 9070 XT',
  'GeForce® RTX 5060 Ti',
  'GeForce® RTX 5060',
  'Radeon™ RX 9060 XT',
  'GeForce® RTX 5050',
  'RTX PRO™ 4000 Blackwell',
  'RTX PRO™ 2000 Blackwell',
];

export const gpuMemorySizeOptions = [
  '6GB GDDR6',
  '8GB GDDR6',
  '12GB GDDR6',
  '16GB GDDR6',
  '16GB GDDR7',
  '32GB GDDR7',
  '12GB GDDR7',
  '8GB GDDR7',
  '24GB GDDR7',
];

export const gpuPowerOptions = [
  '1000 Watt',
  '550 Watt',
  '600 Watt',
  '650 Watt',
  '750 Watt',
  '800 Watt',
  '850 Watt',
  '500 Watt',
  '450 Watt',
  '300 Watt',
  '350 Watt',
];

export const defaultGpuFilters: GpuFilterState = {
  brands: [],
  series: [],
  models: [],
  memorySizes: [],
  powers: [],
  stock: [],
  minPrice: 0,
  maxPrice: GPU_PRICE_CEILING,
};

export function applyGpuFilters(products: GpuProduct[], filters: GpuFilterState): GpuProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.series.length > 0 && !filters.series.includes(product.series)) return false;
    if (filters.models.length > 0 && !filters.models.includes(product.model)) return false;
    if (filters.memorySizes.length > 0 && !filters.memorySizes.includes(product.memorySize)) return false;
    if (filters.powers.length > 0 && !filters.powers.includes(product.power)) return false;
    if (filters.stock.length > 0) {
      const status: GpuStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
