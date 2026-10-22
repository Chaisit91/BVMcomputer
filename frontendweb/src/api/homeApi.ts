import { apiGet, withMockFallback } from './request';
import { mockCategories, mockProducts, mockPromoBanners, mockSpecialDeals } from './mockData';
import type { Category, Product, PromoBanner, SpecialDeal } from '../types';

export const getCategories = (): Promise<Category[]> =>
  withMockFallback('GET /categories', () => apiGet<Category[]>('/categories'), () => mockCategories);

export const getProducts = (): Promise<Product[]> =>
  withMockFallback('GET /products/popular', () => apiGet<Product[]>('/products/popular'), () => mockProducts);

export const getPromoBanners = (): Promise<PromoBanner[]> =>
  withMockFallback('GET /banners/promo', () => apiGet<PromoBanner[]>('/banners/promo'), () => mockPromoBanners);

export const getSpecialDeals = (): Promise<SpecialDeal[]> =>
  withMockFallback('GET /deals/special', () => apiGet<SpecialDeal[]>('/deals/special'), () => mockSpecialDeals);
