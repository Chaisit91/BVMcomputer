export type CoolingBrand =
  | 'ASUS'
  | 'COOLER MASTER'
  | 'CORSAIR'
  | 'DEEPCOOL'
  | 'GIGABYTE'
  | 'ID-COOLING'
  | 'iHAVECPU'
  | 'LIAN LI'
  | 'MONTECH'
  | 'MSI'
  | 'NOCTUA'
  | 'NZXT'
  | 'THERMALRIGHT'
  | 'THERMALTAKE'
  | 'TRYX'
  | 'OCYPUS'
  | 'COLORFIRE';
export type CoolingSocket = 'AM4' | 'AM5' | 'LGA 1700' | 'LGA 1851';
export type CoolingBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface CoolingProduct {
  id: string;
  name: string;
  brand: CoolingBrand;
  /** Display-only specs (not sidebar filters — no reference options were given for them). */
  socket: CoolingSocket;
  type: string;
  fanSize: string;
  price: number;
  badge?: CoolingBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const coolingProducts: CoolingProduct[] = [
  { id: 'cool1', name: 'DEEPCOOL LS520 AIO 240mm', brand: 'DEEPCOOL', socket: 'AM5', type: 'AIO Liquid Cooler', fanSize: '240mm', price: 2490, badge: 'สินค้าขายดี', inStock: true },
  { id: 'cool2', name: 'Cooler Master Hyper 212 Air Cooler', brand: 'COOLER MASTER', socket: 'LGA 1700', type: 'Air Cooler', fanSize: '120mm', price: 990, badge: 'แนะนำ', inStock: true },
  { id: 'cool3', name: 'NZXT Kraken 280 AIO', brand: 'NZXT', socket: 'AM5', type: 'AIO Liquid Cooler', fanSize: '280mm', price: 5990, inStock: true },
  { id: 'cool4', name: 'Corsair iCUE H150i Elite 360mm', brand: 'CORSAIR', socket: 'LGA 1700', type: 'AIO Liquid Cooler', fanSize: '360mm', price: 7990, badge: 'แนะนำ', inStock: true },
  { id: 'cool5', name: 'Thermalright Peerless Assassin 120 SE', brand: 'THERMALRIGHT', socket: 'AM5', type: 'Air Cooler', fanSize: '120mm', price: 1290, inStock: true },
  { id: 'cool6', name: 'ID-COOLING SE-224-XT Air Cooler', brand: 'ID-COOLING', socket: 'LGA 1700', type: 'Air Cooler', fanSize: '120mm', price: 690, inStock: true },
  { id: 'cool7', name: 'DEEPCOOL AK620 Air Cooler', brand: 'DEEPCOOL', socket: 'AM4', type: 'Air Cooler', fanSize: '120mm', price: 1790, inStock: true },
  { id: 'cool8', name: 'NZXT Kraken Elite 360 RGB', brand: 'NZXT', socket: 'LGA 1851', type: 'AIO Liquid Cooler', fanSize: '360mm', price: 9490, badge: 'ใหม่', inStock: false },
  { id: 'cool9', name: 'Thermalright Frozen Warframe 360', brand: 'THERMALRIGHT', socket: 'AM5', type: 'AIO Liquid Cooler', fanSize: '360mm', price: 3490, inStock: true },
  { id: 'cool10', name: 'Corsair A115 Air Cooler', brand: 'CORSAIR', socket: 'AM4', type: 'Air Cooler', fanSize: '135mm', price: 2290, inStock: true },
  { id: 'cool11', name: 'Cooler Master MasterLiquid 240L Core', brand: 'COOLER MASTER', socket: 'AM5', type: 'AIO Liquid Cooler', fanSize: '240mm', price: 2190, inStock: true },
  { id: 'cool12', name: 'ID-COOLING SL120 AIO 120mm', brand: 'ID-COOLING', socket: 'LGA 1851', type: 'AIO Liquid Cooler', fanSize: '120mm', price: 1990, inStock: true },
];

export type CoolingStockStatus = 'in' | 'preorder';

export interface CoolingFilterState {
  brands: CoolingBrand[];
  stock: CoolingStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const COOLING_PRICE_CEILING = 10000;

export const coolingBrandOptions: CoolingBrand[] = [
  'ASUS',
  'COOLER MASTER',
  'CORSAIR',
  'DEEPCOOL',
  'GIGABYTE',
  'ID-COOLING',
  'iHAVECPU',
  'LIAN LI',
  'MONTECH',
  'MSI',
  'NOCTUA',
  'NZXT',
  'THERMALRIGHT',
  'THERMALTAKE',
  'TRYX',
  'OCYPUS',
  'COLORFIRE',
];

export const defaultCoolingFilters: CoolingFilterState = {
  brands: [],
  stock: [],
  minPrice: 0,
  maxPrice: COOLING_PRICE_CEILING,
};

export function applyCoolingFilters(products: CoolingProduct[], filters: CoolingFilterState): CoolingProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.stock.length > 0) {
      const status: CoolingStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
