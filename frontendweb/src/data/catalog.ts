import { cpuProducts, type CpuProduct } from './cpuProducts';
import { gpuProducts, type GpuProduct } from './gpuProducts';
import { motherboardProducts, type MotherboardProduct } from './motherboardProducts';
import { ramProducts, type RamProduct } from './ramProducts';
import { storageProducts, type StorageProduct } from './storageProducts';
import { psuProducts, type PsuProduct } from './psuProducts';
import { caseProducts, type CaseProduct } from './caseProducts';
import { coolingProducts, type CoolingProduct } from './coolingProducts';
import { desktopPcProducts, type DesktopPcProduct } from './desktopPcProducts';
import { pcSetProducts, type PcSetProduct } from './pcSetProducts';

/**
 * Category slug (as used in URLs and API calls) -> the product shape the backend
 * returns for it. Everything that loads products by category is typed off this map,
 * so `getCategoryProducts('gpu')` is known to resolve to `GpuProduct[]`.
 */
export interface CategoryProductMap {
  cpu: CpuProduct;
  gpu: GpuProduct;
  motherboard: MotherboardProduct;
  ram: RamProduct;
  storage: StorageProduct;
  psu: PsuProduct;
  case: CaseProduct;
  cooling: CoolingProduct;
  'desktop-pc': DesktopPcProduct;
  'pc-sets': PcSetProduct;
}

export type ProductCategorySlug = keyof CategoryProductMap;

export type CatalogLists = { [K in ProductCategorySlug]: CategoryProductMap[K][] };

export const productCategorySlugs: ProductCategorySlug[] = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'case',
  'cooling',
  'desktop-pc',
  'pc-sets',
];

export function isProductCategorySlug(value: string): value is ProductCategorySlug {
  return (productCategorySlugs as string[]).includes(value);
}

/** Bundled mock catalog — only served when the backend is unreachable or API_MODE is "mock". */
export const mockCatalog: CatalogLists = {
  cpu: cpuProducts,
  gpu: gpuProducts,
  motherboard: motherboardProducts,
  ram: ramProducts,
  storage: storageProducts,
  psu: psuProducts,
  case: caseProducts,
  cooling: coolingProducts,
  'desktop-pc': desktopPcProducts,
  'pc-sets': pcSetProducts,
};
