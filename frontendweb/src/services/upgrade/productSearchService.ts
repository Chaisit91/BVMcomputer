import { cpuProducts } from '../../data/cpuProducts';
import { gpuProducts } from '../../data/gpuProducts';
import { motherboardProducts } from '../../data/motherboardProducts';
import { ramProducts } from '../../data/ramProducts';
import { storageProducts } from '../../data/storageProducts';
import { psuProducts } from '../../data/psuProducts';
import { caseProducts } from '../../data/caseProducts';
import { coolingProducts } from '../../data/coolingProducts';
import { skuFromId } from '../../data/productLookup';
import type { UpgradeComponentKey, UpgradeProduct } from '../../types/upgrade';

function toUpgradeProduct(
  p: { id: string; name: string; brand: string; price: number; imageUrl?: string },
  category: UpgradeComponentKey,
  specifications: string[],
): UpgradeProduct {
  return {
    productId: p.id,
    name: p.name,
    brand: p.brand,
    sku: skuFromId(p.id),
    price: p.price,
    category,
    image: p.imageUrl,
    specifications,
  };
}

// Reuses the exact same catalogs and spec-line formulas as the PC-builder (BuildCategoryPage),
// so a part described here and there always reads the same way.
const catalogs: Record<UpgradeComponentKey, () => UpgradeProduct[]> = {
  cpu: () => cpuProducts.map((p) => toUpgradeProduct(p, 'cpu', [`${p.cores}C/${p.threads}T`, p.clock, p.socket])),
  gpu: () => gpuProducts.map((p) => toUpgradeProduct(p, 'gpu', [p.memorySize, p.boostClock, p.model])),
  motherboard: () => motherboardProducts.map((p) => toUpgradeProduct(p, 'motherboard', [p.chipset, p.socket, p.formFactor])),
  ram: () => ramProducts.map((p) => toUpgradeProduct(p, 'ram', [p.capacity, p.memoryType, p.speed])),
  storage: () => storageProducts.map((p) => toUpgradeProduct(p, 'storage', [p.capacity, p.type, p.readSpeed])),
  psu: () => psuProducts.map((p) => toUpgradeProduct(p, 'psu', [p.wattage, p.certification, p.modular])),
  case: () => caseProducts.map((p) => toUpgradeProduct(p, 'case', [p.formFactor, p.sidePanel])),
  cooling: () => coolingProducts.map((p) => toUpgradeProduct(p, 'cooling', [p.type, p.fanSize, p.socket])),
};

/**
 * TODO(backend): swap for `GET /api/products?category=` (paginated) once the real catalog
 * endpoint exists. Same return shape as the search below, so callers won't change.
 */
export async function listUpgradeProducts(component: UpgradeComponentKey): Promise<UpgradeProduct[]> {
  return catalogs[component]();
}

/**
 * TODO(backend): swap this local filter for `GET /api/products/search?q=` once the
 * real product-search endpoint exists. The signature and return shape (a Promise of
 * UpgradeProduct[]) already match what that call would return, so callers won't change.
 */
export async function searchUpgradeProducts(component: UpgradeComponentKey, query: string): Promise<UpgradeProduct[]> {
  const pool = catalogs[component]();
  const q = query.trim().toLowerCase();
  if (!q) return pool.slice(0, 8);
  return pool.filter((item) => `${item.brand} ${item.name}`.toLowerCase().includes(q)).slice(0, 8);
}
