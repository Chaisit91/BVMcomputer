import { getCategoryProducts } from '../../api/productApi';
import { skuFromId } from '../../data/productLookup';
import type { CategoryProductMap } from '../../data/catalog';
import type { UpgradeComponentKey, UpgradeProduct } from '../../types/upgrade';

// Same spec-line formulas as the PC-builder (BuildCategoryPage), so a part
// described here and there always reads the same way.
const specLines: { [K in UpgradeComponentKey]: (p: CategoryProductMap[K]) => string[] } = {
  cpu: (p) => [`${p.cores}C/${p.threads}T`, p.clock, p.socket],
  gpu: (p) => [p.memorySize, p.boostClock, p.model],
  motherboard: (p) => [p.chipset, p.socket, p.formFactor],
  ram: (p) => [p.capacity, p.memoryType, p.speed],
  storage: (p) => [p.capacity, p.type, p.readSpeed],
  psu: (p) => [p.wattage, p.certification, p.modular],
  case: (p) => [p.formFactor, p.sidePanel],
  cooling: (p) => [p.type, p.fanSize, p.socket],
};

function toUpgradeProduct<K extends UpgradeComponentKey>(category: K, p: CategoryProductMap[K]): UpgradeProduct {
  return {
    productId: p.id,
    name: p.name,
    brand: p.brand,
    sku: skuFromId(p.id),
    price: p.price,
    category,
    image: p.imageUrl,
    specifications: specLines[category](p),
  };
}

// The search box calls this on every keystroke — keep one in-flight/finished request
// per category instead of refetching the whole list each time. Failed requests are
// dropped from the cache so the next call retries.
const cache = new Map<UpgradeComponentKey, Promise<UpgradeProduct[]>>();

/** Backed by GET /products?category= (via productApi). */
export function listUpgradeProducts(component: UpgradeComponentKey): Promise<UpgradeProduct[]> {
  const cached = cache.get(component);
  if (cached) return cached;

  const request = getCategoryProducts(component).then((products) =>
    products.map((p) => toUpgradeProduct(component, p)),
  );
  cache.set(component, request);
  request.catch(() => cache.delete(component));
  return request;
}

/** Filters the category list locally — the lists are small enough that a round-trip per keystroke isn't worth it. */
export async function searchUpgradeProducts(component: UpgradeComponentKey, query: string): Promise<UpgradeProduct[]> {
  const pool = await listUpgradeProducts(component);
  const q = query.trim().toLowerCase();
  if (!q) return pool.slice(0, 8);
  return pool.filter((item) => `${item.brand} ${item.name}`.toLowerCase().includes(q)).slice(0, 8);
}
