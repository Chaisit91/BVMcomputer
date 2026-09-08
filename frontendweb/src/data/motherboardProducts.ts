export type MotherboardBrand = 'ASROCK' | 'ASUS' | 'COLORFUL' | 'GIGABYTE' | 'MSI' | 'COLORFIRE';
export type MotherboardSocket = 'AM4' | 'AM5' | 'LGA 1700' | 'LGA 1851';
export type MotherboardBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface MotherboardProduct {
  id: string;
  name: string;
  brand: MotherboardBrand;
  cpuSupport: string;
  socket: MotherboardSocket;
  chipset: string;
  /** "Mainboard Support" filter on the reference site — the board's own form factor (ATX/Micro-ATX/Mini-ITX). */
  formFactor: string;
  memorySlots: string;
  memoryType: string;
  maxMemory: string;
  price: number;
  badge?: MotherboardBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const motherboardProducts: MotherboardProduct[] = [
  { id: 'mb1', name: 'ASUS ROG STRIX B650E-F GAMING WIFI', brand: 'ASUS', cpuSupport: 'AMD Ryzen 7000 Series', socket: 'AM5', chipset: 'AMD B650', formFactor: 'ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '128GB', price: 9990, badge: 'สินค้าขายดี', inStock: true },
  { id: 'mb2', name: 'MSI MEG X870E GODLIKE', brand: 'MSI', cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD X870', formFactor: 'ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '256GB', price: 32900, badge: 'แนะนำ', inStock: true },
  { id: 'mb3', name: 'GIGABYTE B760M GAMING X AX', brand: 'GIGABYTE', cpuSupport: '13th Gen', socket: 'LGA 1700', chipset: 'Intel® B760', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR5', maxMemory: '96GB', price: 5990, inStock: true },
  { id: 'mb4', name: 'ASROCK Z790 PG LIGHTNING', brand: 'ASROCK', cpuSupport: '14th Gen', socket: 'LGA 1700', chipset: 'Intel® Z790', formFactor: 'ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '192GB', price: 8490, inStock: true },
  { id: 'mb5', name: 'ASUS PRIME A620M-K', brand: 'ASUS', cpuSupport: 'AMD Ryzen 8000 Series', socket: 'AM5', chipset: 'AMD A620', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR5', maxMemory: '64GB', price: 4290, inStock: true },
  { id: 'mb6', name: 'MSI PRO B550M-A PRO', brand: 'MSI', cpuSupport: 'AMD Ryzen 5000 Series', socket: 'AM4', chipset: 'AMD B550', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR4', maxMemory: '64GB', price: 2990, inStock: true },
  { id: 'mb7', name: 'GIGABYTE X870 AORUS ELITE', brand: 'GIGABYTE', cpuSupport: 'AMD Ryzen 9000 Series', socket: 'AM5', chipset: 'AMD X870', formFactor: 'ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '192GB', price: 12900, badge: 'แนะนำ', inStock: true },
  { id: 'mb8', name: 'COLORFUL CVN Z890 GAMING FROZEN', brand: 'COLORFUL', cpuSupport: 'CORE ULTRA', socket: 'LGA 1851', chipset: 'Intel® Z890', formFactor: 'ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '256GB', price: 14900, badge: 'ใหม่', inStock: true },
  { id: 'mb9', name: 'ASROCK A520M-HVS', brand: 'ASROCK', cpuSupport: 'AMD Ryzen 3000 Series', socket: 'AM4', chipset: 'AMD A520', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR4', maxMemory: '64GB', price: 1890, inStock: true },
  { id: 'mb10', name: 'COLORFIRE B760M PRO', brand: 'COLORFIRE', cpuSupport: '12th Gen', socket: 'LGA 1700', chipset: 'Intel® B760', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR4', maxMemory: '96GB', price: 3290, inStock: true },
  { id: 'mb11', name: 'ASUS PRIME H610M-K', brand: 'ASUS', cpuSupport: '12th Gen', socket: 'LGA 1700', chipset: 'Intel® H610', formFactor: 'Micro-ATX', memorySlots: '2 x DIMM', memoryType: 'DDR4', maxMemory: '64GB', price: 2690, inStock: true },
  { id: 'mb12', name: 'GIGABYTE B860M GAMING WIFI6', brand: 'GIGABYTE', cpuSupport: '13th Gen Intel® Core™', socket: 'LGA 1851', chipset: 'Intel® B860', formFactor: 'Micro-ATX', memorySlots: '4 x DIMM', memoryType: 'DDR5', maxMemory: '128GB', price: 6490, inStock: false },
];

export type MotherboardStockStatus = 'in' | 'preorder';

export interface MotherboardFilterState {
  brands: MotherboardBrand[];
  cpuSupports: string[];
  sockets: MotherboardSocket[];
  chipsets: string[];
  formFactors: string[];
  memorySlots: string[];
  memoryTypes: string[];
  maxMemories: string[];
  stock: MotherboardStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const MOTHERBOARD_PRICE_CEILING = 35000;

export const motherboardBrandOptions: MotherboardBrand[] = [
  'ASROCK',
  'ASUS',
  'COLORFUL',
  'GIGABYTE',
  'MSI',
  'COLORFIRE',
];

export const motherboardCpuSupportOptions = [
  '12th Gen',
  '13th Gen',
  '14th Gen',
  'CORE ULTRA',
  'AMD Ryzen 3000 G-Series',
  'AMD Ryzen 3000 Series',
  'AMD Ryzen 4000 G-Series',
  'AMD Ryzen 4000 Series',
  'AMD Ryzen 5000 G-Series',
  'AMD Ryzen 5000 Series',
  'AMD Ryzen 7000 Series',
  'AMD Ryzen 8000 Series',
  'AMD Ryzen 9000 Series',
  '13th Gen Intel® Core™',
  '3000 Series',
  '4000 Series',
  '5000 Series',
  '7000 Series',
  '8000 Series',
  '9000 Series',
];

export const motherboardSocketOptions: MotherboardSocket[] = ['AM4', 'AM5', 'LGA 1700', 'LGA 1851'];

export const motherboardChipsetOptions = [
  'Intel® H610',
  'AMD B550',
  'AMD A520',
  'Intel® Z790',
  'Intel® B760',
  'AMD B650',
  'AMD A620',
  'AMD X870',
  'Intel® Z890',
  'Intel® B860',
  'AMD B850',
  'Intel® H810',
  'AMD A620A',
  'AMD B840',
];

// "Mainboard Support" section on the reference site — the board's own form factor.
export const motherboardFormFactorOptions = ['ATX', 'Micro-ATX', 'Mini-ITX'];

// "Memory Slots" section — the reference list carries both the "N x DIMM" labels
// and bare "Nx" duplicates verbatim, so replicated as-is.
export const motherboardMemorySlotOptions = ['2 x DIMM', '4 x DIMM', '2x', '4x'];

export const motherboardMemoryTypeOptions = ['DDR5', 'DDR4'];

export const motherboardMaxMemoryOptions = ['64GB', '96GB', '128GB', '192GB', '256GB'];

export const defaultMotherboardFilters: MotherboardFilterState = {
  brands: [],
  cpuSupports: [],
  sockets: [],
  chipsets: [],
  formFactors: [],
  memorySlots: [],
  memoryTypes: [],
  maxMemories: [],
  stock: [],
  minPrice: 0,
  maxPrice: MOTHERBOARD_PRICE_CEILING,
};

export function applyMotherboardFilters(
  products: MotherboardProduct[],
  filters: MotherboardFilterState,
): MotherboardProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.cpuSupports.length > 0 && !filters.cpuSupports.includes(product.cpuSupport)) return false;
    if (filters.sockets.length > 0 && !filters.sockets.includes(product.socket)) return false;
    if (filters.chipsets.length > 0 && !filters.chipsets.includes(product.chipset)) return false;
    if (filters.formFactors.length > 0 && !filters.formFactors.includes(product.formFactor)) return false;
    if (filters.memorySlots.length > 0 && !filters.memorySlots.includes(product.memorySlots)) return false;
    if (filters.memoryTypes.length > 0 && !filters.memoryTypes.includes(product.memoryType)) return false;
    if (filters.maxMemories.length > 0 && !filters.maxMemories.includes(product.maxMemory)) return false;
    if (filters.stock.length > 0) {
      const status: MotherboardStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
