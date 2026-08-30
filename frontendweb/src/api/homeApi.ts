import { api } from './axiosClient';
import { mockBrands, mockCategories, mockProducts, mockPromoBanners } from './mockData';
import type { Brand, Category, Product, PromoBanner } from '../types';

/**
 * Try the real backend first; if it's unreachable (not built yet, CORS not
 * configured, offline, ...) fall back to mockup data so the UI keeps working.
 * Once the backend is live this silently starts returning real data with no
 * component changes needed.
 */
async function safeGet<T>(url: string, fallback: T): Promise<T> {
  try {
    const { data } = await api.get<T>(url);
    return data;
  } catch {
    return fallback;
  }
}

export const getCategories = (): Promise<Category[]> => safeGet('/categories', mockCategories);

export const getProducts = (): Promise<Product[]> => safeGet('/products/popular', mockProducts);

export const getPromoBanners = (): Promise<PromoBanner[]> => safeGet('/banners/promo', mockPromoBanners);

export const getBrands = (): Promise<Brand[]> => safeGet('/brands', mockBrands);
