export type CaseBrand =
  | 'ASUS'
  | 'COOLER MASTER'
  | 'CORSAIR'
  | 'DEEPCOOL'
  | 'GIGABYTE'
  | 'HYTE'
  | 'iHAVECPU'
  | 'LIAN LI'
  | 'MONTECH'
  | 'MSI'
  | 'NZXT'
  | 'THERMALTAKE'
  | 'HAVN'
  | 'TRYX'
  | 'OCYPUS'
  | 'SEGOTEP x COLORFIRE';

export type CaseFormFactor = 'ATX' | 'E-ATX' | 'Micro-ATX' | 'Mini-ITX';
export type CaseBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

export interface CaseProduct {
  id: string;
  name: string;
  brand: CaseBrand;
  formFactor: CaseFormFactor;
  /** Display-only spec (not a sidebar filter — no reference options were given for it). */
  caseType: string;
  sidePanel: string;
  price: number;
  badge?: CaseBadge;
  inStock: boolean;
  /** Real product photo URL, once the backend/team provides one — falls back to a category icon when absent. */
  imageUrl?: string;
}

// Mockup content only — the backend team owns the real product catalog;
// this stands in until that endpoint exists.
export const caseProducts: CaseProduct[] = [
  { id: 'case1', name: 'CORSAIR 4000D Airflow', brand: 'CORSAIR', formFactor: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 3290, badge: 'สินค้าขายดี', inStock: true },
  { id: 'case2', name: 'NZXT H510 Flow', brand: 'NZXT', formFactor: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 2990, badge: 'แนะนำ', inStock: true },
  { id: 'case3', name: 'LIAN LI O11 Dynamic EVO', brand: 'LIAN LI', formFactor: 'E-ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 5990, badge: 'แนะนำ', inStock: true },
  { id: 'case4', name: 'COOLER MASTER MasterBox Q300L', brand: 'COOLER MASTER', formFactor: 'Micro-ATX', caseType: 'Mini Tower', sidePanel: 'Mesh', price: 1490, inStock: true },
  { id: 'case5', name: 'DEEPCOOL CH370', brand: 'DEEPCOOL', formFactor: 'Micro-ATX', caseType: 'Mini Tower', sidePanel: 'Tempered Glass', price: 1290, inStock: true },
  { id: 'case6', name: 'HYTE Y60', brand: 'HYTE', formFactor: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 6490, inStock: true },
  { id: 'case7', name: 'MONTECH AIR 903 MAX', brand: 'MONTECH', formFactor: 'E-ATX', caseType: 'Mid Tower', sidePanel: 'Mesh', price: 2690, inStock: true },
  { id: 'case8', name: 'NZXT H1 V2', brand: 'NZXT', formFactor: 'Mini-ITX', caseType: 'Mini Tower', sidePanel: 'Tempered Glass', price: 5490, badge: 'ใหม่', inStock: false },
  { id: 'case9', name: 'THERMALTAKE Core P3 TG', brand: 'THERMALTAKE', formFactor: 'E-ATX', caseType: 'Full Tower', sidePanel: 'Tempered Glass', price: 8900, inStock: true },
  { id: 'case10', name: 'HAVN HS 420', brand: 'HAVN', formFactor: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 4990, inStock: true },
  { id: 'case11', name: 'ASUS TUF Gaming GT302', brand: 'ASUS', formFactor: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', price: 3490, inStock: true },
  { id: 'case12', name: 'SEGOTEP x COLORFIRE C6', brand: 'SEGOTEP x COLORFIRE', formFactor: 'Mini-ITX', caseType: 'Mini Tower', sidePanel: 'Tempered Glass', price: 1990, inStock: true },
];

export type CaseStockStatus = 'in' | 'preorder';

export interface CaseFilterState {
  brands: CaseBrand[];
  formFactors: CaseFormFactor[];
  stock: CaseStockStatus[];
  minPrice: number;
  maxPrice: number;
}

export const CASE_PRICE_CEILING = 15000;

export const caseBrandOptions: CaseBrand[] = [
  'ASUS',
  'COOLER MASTER',
  'CORSAIR',
  'DEEPCOOL',
  'GIGABYTE',
  'HYTE',
  'iHAVECPU',
  'LIAN LI',
  'MONTECH',
  'MSI',
  'NZXT',
  'THERMALTAKE',
  'HAVN',
  'TRYX',
  'OCYPUS',
  'SEGOTEP x COLORFIRE',
];

// "Mainboard Support" filter options — matches the real filter list this is meant to mirror.
export const caseFormFactorOptions: CaseFormFactor[] = ['ATX', 'E-ATX', 'Micro-ATX', 'Mini-ITX'];

export const defaultCaseFilters: CaseFilterState = {
  brands: [],
  formFactors: [],
  stock: [],
  minPrice: 0,
  maxPrice: CASE_PRICE_CEILING,
};

export function applyCaseFilters(products: CaseProduct[], filters: CaseFilterState): CaseProduct[] {
  return products.filter((product) => {
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.formFactors.length > 0 && !filters.formFactors.includes(product.formFactor)) return false;
    if (filters.stock.length > 0) {
      const status: CaseStockStatus = product.inStock ? 'in' : 'preorder';
      if (!filters.stock.includes(status)) return false;
    }
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return true;
  });
}
