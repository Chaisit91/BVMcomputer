import type { Product, CategoryIconKey } from '../types';
import { cpuProducts } from './cpuProducts';
import { gpuProducts } from './gpuProducts';
import { motherboardProducts } from './motherboardProducts';
import { ramProducts } from './ramProducts';
import { storageProducts } from './storageProducts';
import { psuProducts } from './psuProducts';
import { caseProducts } from './caseProducts';
import { coolingProducts } from './coolingProducts';

export interface CartRecommendationItem extends Product {
  /** Short product-type line shown under the name, e.g. "Air Cooler", "SSD M.2 NVMe". */
  subtitle: string;
}

function pick<T extends { id: string; name: string; brand: string; price: number; imageUrl?: string }>(
  items: T[],
  category: CategoryIconKey,
  subtitle: (item: T) => string,
): CartRecommendationItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.id,
    price: item.price,
    category,
    brand: item.brand,
    imageUrl: item.imageUrl,
    subtitle: subtitle(item),
  }));
}

/**
 * Small cross-category upsell pool for the cart drawer's "สินค้าที่คุณอาจสนใจ" section.
 * Deliberately a curated slice of each category (not the full catalog) so the
 * drawer's recommendation list stays short and fast to scan.
 */
export const cartRecommendations: CartRecommendationItem[] = [
  ...pick(coolingProducts.slice(0, 3), 'cooling', (item) => item.type),
  ...pick(storageProducts.slice(0, 3), 'storage', (item) => item.type),
  ...pick(psuProducts.slice(0, 2), 'psu', () => 'พาวเวอร์ซัพพลาย'),
  ...pick(ramProducts.slice(0, 2), 'ram', () => 'แรม'),
  ...pick(caseProducts.slice(0, 2), 'case', () => 'เคส'),
  ...pick(motherboardProducts.slice(0, 2), 'motherboard', () => 'เมนบอร์ด'),
  ...pick(gpuProducts.slice(0, 2), 'gpu', () => 'การ์ดจอ'),
  ...pick(cpuProducts.slice(0, 2), 'cpu', () => 'ซีพียู'),
];
