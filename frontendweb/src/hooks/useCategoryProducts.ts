import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCategoryProducts } from '../features/catalog/catalogSlice';
import type { CategoryProductMap, ProductCategorySlug } from '../data/catalog';
import type { RequestStatus } from '../types/api';

interface UseCategoryProductsResult<T> {
  products: T[];
  status: RequestStatus;
  error: string | null;
  /** Refetch even if the list is cached — for "retry" buttons. */
  reload: () => void;
}

interface UseCategoryProductsOptions {
  /** false = don't load yet (e.g. an autocomplete that only needs the list once it's opened). Default true. */
  enabled?: boolean;
}

/** Loads (once, then cached in Redux) and returns one category's product list. */
export function useCategoryProducts<K extends ProductCategorySlug>(
  slug: K,
  { enabled = true }: UseCategoryProductsOptions = {},
): UseCategoryProductsResult<CategoryProductMap[K]> {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.catalog[slug]);

  useEffect(() => {
    if (enabled) void dispatch(fetchCategoryProducts({ slug }));
  }, [dispatch, slug, enabled]);

  const reload = useCallback(() => {
    void dispatch(fetchCategoryProducts({ slug, force: true }));
  }, [dispatch, slug]);

  return { products: list.items, status: list.status, error: list.error, reload };
}
