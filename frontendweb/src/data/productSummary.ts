import type { CategoryProductMap, ProductCategorySlug } from './catalog';
import { toCartCategoryKey } from './productLookup';
import type { Product } from '../types';

/** One-line key spec per category, e.g. "8C/16T · 4.2 - 5.0 GHz · AM5" — for compact product cards. */
const specLineBuilders: { [K in ProductCategorySlug]: (product: CategoryProductMap[K]) => string } = {
  cpu: (p) => `${p.cores}C/${p.threads}T · ${p.clock} · ${p.socket}`,
  gpu: (p) => `${p.memorySize} · ${p.boostClock} · ${p.model}`,
  motherboard: (p) => `${p.chipset} · ${p.socket} · ${p.formFactor}`,
  ram: (p) => `${p.capacity} · ${p.memoryType} · ${p.speed}`,
  storage: (p) => `${p.capacity} · ${p.type} · ${p.readSpeed}`,
  psu: (p) => `${p.wattage} · ${p.certification} · ${p.modular}`,
  case: (p) => `${p.formFactor} · ${p.sidePanel}`,
  cooling: (p) => `${p.type} · ${p.fanSize} · ${p.socket}`,
  'desktop-pc': (p) => `${p.cpu} · ${p.gpu} · ${p.ram}`,
  'pc-sets': (p) => `${p.cpu} · ${p.gpu} · ${p.ram}`,
};

export function productSpecLine<K extends ProductCategorySlug>(category: K, product: CategoryProductMap[K]): string {
  return specLineBuilders[category](product);
}

/** The cart's product shape for any catalog product. */
export function toCartProduct<K extends ProductCategorySlug>(category: K, product: CategoryProductMap[K]): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.id,
    price: product.price,
    category: toCartCategoryKey(category),
    brand: product.brand,
    imageUrl: product.imageUrl,
    shortSpec: productSpecLine(category, product),
  };
}
