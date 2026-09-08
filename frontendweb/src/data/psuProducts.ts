export type PsuBrand =
  | 'AEROCOOL'
  | 'ASROCK'
  | 'ASUS'
  | 'COOLER MASTER'
  | 'CORSAIR'
  | 'DEEPCOOL'
  | 'FSP'
  | 'GIGABYTE'
  | 'MSI'
  | 'THERMALRIGHT'
  | 'THERMALTAKE';

export type PsuCertification = '80+ Bronze' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
export type PsuBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface PsuProduct {
  id: string;
  name: string;
  brand: PsuBrand;
  /** Display-only spec (not a sidebar filter — no reference options were given for it). */
  certification: PsuCertification;
  wattage: string;
  modular: string;
  price: number;
  badge?: PsuBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const psuProducts: PsuProduct[] = [
  { id: 'psu1', name: 'CORSAIR RM850x 850 Watt 80+ Gold', brand: 'CORSAIR', certification: '80+ Gold', wattage: '850 Watt', modular: 'Full Modular', price: 4990, badge: 'สินค้าขายดี', inStock: true },
  { id: 'psu2', name: 'COOLER MASTER MWE Gold 650 Watt', brand: 'COOLER MASTER', certification: '80+ Gold', wattage: '650 Watt', modular: 'Full Modular', price: 2990, inStock: true },
  { id: 'psu3', name: 'FSP Hydro G PRO 750 Watt 80+ Gold', brand: 'FSP', certification: '80+ Gold', wattage: '750 Watt', modular: 'Full Modular', price: 3990, inStock: true },
  { id: 'psu4', name: 'MSI MAG A650BN 650 Watt 80+ Bronze', brand: 'MSI', certification: '80+ Bronze', wattage: '650 Watt', modular: 'Non Modular', price: 1890, inStock: true },
  { id: 'psu5', name: 'ASUS ROG STRIX 1000 Watt 80+ Platinum', brand: 'ASUS', certification: '80+ Platinum', wattage: '1000 Watt', modular: 'Full Modular', price: 7990, inStock: true },
  { id: 'psu6', name: 'DEEPCOOL PK550D 550 Watt 80+ Bronze', brand: 'DEEPCOOL', certification: '80+ Bronze', wattage: '550 Watt', modular: 'Non Modular', price: 1490, inStock: true },
  { id: 'psu7', name: 'CORSAIR HX1200 1200 Watt 80+ Platinum', brand: 'CORSAIR', certification: '80+ Platinum', wattage: '1200 Watt', modular: 'Full Modular', price: 9990, badge: 'แนะนำ', inStock: true },
  { id: 'psu8', name: 'THERMALTAKE Toughpower GF3 1000 Watt 80+ Gold', brand: 'THERMALTAKE', certification: '80+ Gold', wattage: '1000 Watt', modular: 'Full Modular', price: 6490, badge: 'ใหม่', inStock: false },
  { id: 'psu9', name: 'AEROCOOL LUX 550 Watt 80+ Bronze', brand: 'AEROCOOL', certification: '80+ Bronze', wattage: '550 Watt', modular: 'Non Modular', price: 1290, inStock: true },
  { id: 'psu10', name: 'GIGABYTE UD850GM 850 Watt 80+ Gold', brand: 'GIGABYTE', certification: '80+ Gold', wattage: '850 Watt', modular: 'Full Modular', price: 5290, inStock: true },
  { id: 'psu11', name: 'ASROCK PG-750G 750 Watt 80+ Gold', brand: 'ASROCK', certification: '80+ Gold', wattage: '750 Watt', modular: 'Full Modular', price: 3690, inStock: true },
  { id: 'psu12', name: 'THERMALRIGHT TG-850 850 Watt 80+ Bronze', brand: 'THERMALRIGHT', certification: '80+ Bronze', wattage: '850 Watt', modular: 'Semi Modular', price: 2790, inStock: true },
];

export type PsuStockStatus = 'in' | 'preorder';

export interface PsuFilterState {
  brands: PsuBrand[];
  wattages: string[];
  stock: PsuStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const PSU_PRICE_CEILING = 15000;

export const psuBrandOptions: PsuBrand[] = [
  'AEROCOOL',
  'ASROCK',
  'ASUS',
  'COOLER MASTER',
  'CORSAIR',
  'DEEPCOOL',
  'FSP',
  'GIGABYTE',
  'MSI',
  'THERMALRIGHT',
  'THERMALTAKE',
];

// "Continuous Power W" filter options — matches the real filter list this is meant to mirror.
export const psuWattageOptions = ['1000 Watt', '1200 Watt', '550 Watt', '650 Watt', '750 Watt', '850 Watt'];

export const defaultPsuFilters: PsuFilterState = {
  brands: [],
  wattages: [],
  stock: [],
  minPrice: 0,
  maxPrice: PSU_PRICE_CEILING,
};

export function applyPsuFilters(products: PsuProduct[], filters: PsuFilterState): PsuProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.wattages.length > 0 && !filters.wattages.includes(product.wattage)) return false;
    if (filters.stock.length > 0) {
      const status: PsuStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
