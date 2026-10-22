import { ApiError } from './apiError';
import { apiGet, mockDelay, withMockFallback } from './request';
import {
  mockCatalog,
  productCategorySlugs,
  type CategoryProductMap,
  type ProductCategorySlug,
} from '../data/catalog';

/** Compact, category-agnostic product row returned by search. */
export interface ProductSummary {
  id: string;
  categorySlug: ProductCategorySlug;
  name: string;
  brand: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
  badge?: string;
}

/** GET /products?category={slug} — every product in one category. */
export function getCategoryProducts<K extends ProductCategorySlug>(slug: K): Promise<CategoryProductMap[K][]> {
  return withMockFallback(
    `GET /products?category=${slug}`,
    () => apiGet<CategoryProductMap[K][]>('/products', { category: slug }),
    async () => {
      await mockDelay();
      return mockCatalog[slug];
    },
  );
}

/** GET /products/{slug}/{id} — one product, or null when it doesn't exist (404). */
export async function getCategoryProduct<K extends ProductCategorySlug>(
  slug: K,
  id: string,
): Promise<CategoryProductMap[K] | null> {
  try {
    return await withMockFallback(
      `GET /products/${slug}/:id`,
      () => apiGet<CategoryProductMap[K]>(`/products/${slug}/${encodeURIComponent(id)}`),
      async () => {
        await mockDelay();
        const found = (mockCatalog[slug] as CategoryProductMap[K][]).find((product) => product.id === id);
        return found ?? null;
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function toSummary(slug: ProductCategorySlug, product: CategoryProductMap[ProductCategorySlug]): ProductSummary {
  return {
    id: product.id,
    categorySlug: slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    inStock: product.inStock,
    imageUrl: product.imageUrl,
    badge: product.badge,
  };
}

/** GET /products/search?q={query} — name/brand search across every category. */
export function searchProducts(query: string): Promise<ProductSummary[]> {
  return withMockFallback(
    'GET /products/search',
    () => apiGet<ProductSummary[]>('/products/search', { q: query }),
    async () => {
      await mockDelay();
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return productCategorySlugs.flatMap((slug) =>
        mockCatalog[slug]
          .filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(q))
          .map((product) => toSummary(slug, product)),
      );
    },
  );
}
