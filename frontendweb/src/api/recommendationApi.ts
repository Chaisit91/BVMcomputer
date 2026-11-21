import { apiGet, withMockFallback } from './request';
import { cartRecommendations } from '../data/cartRecommendations';
import type { CartRecommendationItem } from '../types';

/**
 * GET /products/recommendations — upsell pool for the cart drawer. The drawer itself
 * hides items already in the cart and shows the first 4, so the backend can return
 * a short curated list (it doesn't need to know the cart contents).
 */
export const getCartRecommendations = (): Promise<CartRecommendationItem[]> =>
  withMockFallback(
    'GET /products/recommendations',
    () => apiGet<CartRecommendationItem[]>('/products/recommendations'),
    () => cartRecommendations,
  );
