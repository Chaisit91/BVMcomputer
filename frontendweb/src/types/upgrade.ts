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

export type CompatibilityStatus = 'compatible' | 'warning' | 'incompatible';

export type UpgradeSelection = Partial<Record<UpgradeComponentKey, UpgradeProduct>>;

/** One compatibility rule evaluated against the final build (current parts + chosen upgrades). */
export interface CompatibilityCheck {
  id: string;
  title: string;
  detail: string;
  status: CompatibilityStatus;
  /** Parts involved, so the UI can point at what to change. */
  components: UpgradeComponentKey[];
  /** How to resolve a warning/problem, when there's a concrete suggestion. */
  fix?: string;
}

export type RecommendationTier = 'primary' | 'sequential' | 'skip';

export interface UpgradeRecommendation {
  category: UpgradeComponentKey;
  tier: RecommendationTier;
  product: UpgradeProduct;
  /** Short tag shown on the card, e.g. "แนะนำที่สุด", "คุ้มค่า". */
  label: string;
  reasons: string[];
}

export interface UpgradeAnalysisRequest {
  currentSpec: UpgradeSelection;
  upgrades: UpgradeSelection;
  unknownParts: UpgradeComponentKey[];
  budget: string;
  usage: string;
  games: string;
}

export interface UpgradeAnalysisResult {
  /** 'mock' = computed in the browser from catalog data because the AI backend isn't connected. */
  source: 'ai' | 'mock';
  score: number;
  maxScore: number;
  checks: CompatibilityCheck[];
  insight: string;
  recommendations: UpgradeRecommendation[];
  analyzedAt: string;
}

export interface UpgradeFormState {
  selected: UpgradeSelection;
  budget: string;
  usage: string;
  games: string;
}
