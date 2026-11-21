import { useMemo } from 'react';
import { useCategoryProducts } from './useCategoryProducts';
import { toUpgradeProducts } from '../services/upgrade/productSearchService';
import type { UpgradeComponentKey } from '../types/upgrade';

/**
 * One category's products in the upgrade flow's shape. The list itself comes from (and is
 * cached in) the Redux catalog, so the upgrade pages, the category pages and the PC builder
 * all share a single request per category.
 */
export function useUpgradeProducts(component: UpgradeComponentKey, options?: { enabled?: boolean }) {
  const { products, status, error, reload } = useCategoryProducts(component, options);
  const upgradeProducts = useMemo(() => toUpgradeProducts(component, products), [component, products]);
  return { products: upgradeProducts, status, error, reload };
}
