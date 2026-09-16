import type { CategoryIconKey } from './index';

/** The 8 part categories the upgrade-advisor flow asks about — a subset of CategoryIconKey. */
export type UpgradeComponentKey = Extract<
  CategoryIconKey,
  'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling'
>;

/**
 * A product as picked from the spec-search autocomplete. Shape is intentionally
 * flat and backend-friendly — this is what gets sent to the AI/compatibility
 * services once those exist.
 */
export interface UpgradeProduct {
  productId: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  category: UpgradeComponentKey;
  image?: string;
  specifications: string[];
}

/** Prepared for the future compatibility-check backend — not wired to real logic yet. */
export type CompatibilityStatus = 'compatible' | 'warning' | 'incompatible';

export type UpgradeSelection = Partial<Record<UpgradeComponentKey, UpgradeProduct>>;

export interface UpgradeFormState {
  selected: UpgradeSelection;
  budget: string;
  usage: string;
  games: string;
}
