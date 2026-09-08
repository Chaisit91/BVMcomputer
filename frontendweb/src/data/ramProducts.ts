export type RamBrand =
  | 'ADATA'
  | 'APACER'
  | 'COLORFUL'
  | 'CORSAIR'
  | 'HIKSEMI'
  | 'KINGSTON'
  | 'LEXAR'
  | 'KINGBANK'
  | 'COLORFIRE';

export type RamMemoryType = 'DDR4' | 'DDR5';
export type RamBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface RamProduct {
  id: string;
  name: string;
  brand: RamBrand;
  series: string;
  capacity: string;
  speed: string;
  memoryType: RamMemoryType;
  price: number;
  badge?: RamBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const ramProducts: RamProduct[] = [
  { id: 'ram1', name: 'CORSAIR VENGEANCE RGB 32GB (16GBx2) DDR5 6000MHz', brand: 'CORSAIR', series: 'VENGEANCE RGB', capacity: '32GB (16GBx2)', speed: '6000MHz', memoryType: 'DDR5', price: 4590, badge: 'สินค้าขายดี', inStock: true },
  { id: 'ram2', name: 'KINGSTON FURY BEAST RGB 16GB (8GBx2) DDR5 6000MHz', brand: 'KINGSTON', series: 'FURY BEAST RGB', capacity: '16GB (8GBx2)', speed: '6000MHz', memoryType: 'DDR5', price: 2290, badge: 'แนะนำ', inStock: true },
  { id: 'ram3', name: 'ADATA XPG LANCER BLADE 32GB (16GBx2) DDR5 6400MHz', brand: 'ADATA', series: 'XPG LANCER BLADE', capacity: '32GB (16GBx2)', speed: '6400MHz', memoryType: 'DDR5', price: 5290, inStock: true },
  { id: 'ram4', name: 'CORSAIR VENGEANCE LPX 16GB (2x 8GB) DDR4 3200MHz', brand: 'CORSAIR', series: 'VENGEANCE LPX', capacity: '16GB (2x 8GB)', speed: '3200MHz', memoryType: 'DDR4', price: 1690, inStock: true },
  { id: 'ram5', name: 'KINGBANK THOR DUAL RGB 32GB (16GBx2) DDR5 6000MHz', brand: 'KINGBANK', series: 'THOR DUAL RGB', capacity: '32GB (16GBx2)', speed: '6000MHz', memoryType: 'DDR5', price: 3890, inStock: true },
  { id: 'ram6', name: 'HIKSEMI ARMOR 16GB (2x 8GB) DDR4 3200MHz', brand: 'HIKSEMI', series: 'ARMOR', capacity: '16GB (2x 8GB)', speed: '3200MHz', memoryType: 'DDR4', price: 1490, inStock: true },
  { id: 'ram7', name: 'KINGSTON FURY BEAST 8GB (8GBx1) DDR4 3200MHz', brand: 'KINGSTON', series: 'FURY BEAST', capacity: '8GB (8GBx1)', speed: '3200MHz', memoryType: 'DDR4', price: 690, inStock: true },
  { id: 'ram8', name: 'ADATA XPG GAMMIX X D35 16GB (8GBx2) DDR4 3200MHz', brand: 'ADATA', series: 'XPG GAMMIX X D35', capacity: '16GB (8GBx2)', speed: '3200MHz', memoryType: 'DDR4', price: 1590, inStock: true },
  { id: 'ram9', name: 'LEXAR ARES RGB 16GB (8GBx2) DDR5 5600MHz', brand: 'LEXAR', series: 'ARES RGB', capacity: '16GB (8GBx2)', speed: '5600MHz', memoryType: 'DDR5', price: 2190, inStock: true },
  { id: 'ram10', name: 'APACER NOX 8GB DDR4 3200MHz', brand: 'APACER', series: 'NOX', capacity: '8GB', speed: '3200MHz', memoryType: 'DDR4', price: 650, inStock: true },
  { id: 'ram11', name: 'COLORFUL PANTHER RGB 16GB (16GBx1) DDR5 5200MHz', brand: 'COLORFUL', series: 'PANTHER RGB', capacity: '16GB (16GBx1)', speed: '5200MHz', memoryType: 'DDR5', price: 2090, inStock: true },
  { id: 'ram12', name: 'COLORFIRE BATTLE-AX 64GB (32GBx2) DDR5 6000MHz', brand: 'COLORFIRE', series: 'BATTLE-AX', capacity: '64GB (32GBx2)', speed: '6000MHz', memoryType: 'DDR5', price: 9990, badge: 'ใหม่', inStock: false },
];

export type RamStockStatus = 'in' | 'preorder';

export interface RamFilterState {
  brands: RamBrand[];
  series: string[];
  capacities: string[];
  speeds: string[];
  memoryTypes: RamMemoryType[];
  stock: RamStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const RAM_PRICE_CEILING = 15000;

export const ramBrandOptions: RamBrand[] = [
  'ADATA',
  'APACER',
  'COLORFUL',
  'CORSAIR',
  'HIKSEMI',
  'KINGSTON',
  'LEXAR',
  'KINGBANK',
  'COLORFIRE',
];

export const ramSeriesOptions = [
  'PANTHER',
  'U-DIMM',
  'VENGEANCE LPX',
  'VENGEANCE RGB PRO SL',
  'FURY BEAST RGB',
  'VENGEANCE RGB',
  'VENGEANCE',
  'FURY BEAST',
  'ARES RGB',
  'THOR',
  'ARMOR',
  'NOX',
  'KJXS',
  'THOR DUAL RGB',
  'XPG GAMMIX X D35',
  'PANTHER RGB',
  'FUTURE',
  'MEOW',
  'XPG LANCER BLADE',
  'BATTLE-AX',
];

export const ramCapacityOptions = [
  '16GB (16GBx1)',
  '16GB (8GBx2)',
  '32GB (16GBx2)',
  '64GB (32GBx2)',
  '8GB (8GBx1)',
  '8GB',
  '16GB',
  '16GB (2x 8GB)',
];

export const ramSpeedOptions = ['3200MHz', '5200MHz', '5600MHz', '6000MHz', '6400MHz'];

export const ramMemoryTypeOptions: RamMemoryType[] = ['DDR5', 'DDR4'];

export const defaultRamFilters: RamFilterState = {
  brands: [],
  series: [],
  capacities: [],
  speeds: [],
  memoryTypes: [],
  stock: [],
  minPrice: 0,
  maxPrice: RAM_PRICE_CEILING,
};

export function applyRamFilters(products: RamProduct[], filters: RamFilterState): RamProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.series.length > 0 && !filters.series.includes(product.series)) return false;
    if (filters.capacities.length > 0 && !filters.capacities.includes(product.capacity)) return false;
    if (filters.speeds.length > 0 && !filters.speeds.includes(product.speed)) return false;
    if (filters.memoryTypes.length > 0 && !filters.memoryTypes.includes(product.memoryType)) return false;
    if (filters.stock.length > 0) {
      const status: RamStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
