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

/** Loads (once, then cached in Redux) and returns one category's product list. */
export function useCategoryProducts<K extends ProductCategorySlug>(
  slug: K,
): UseCategoryProductsResult<CategoryProductMap[K]> {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.catalog[slug]);

  useEffect(() => {
    void dispatch(fetchCategoryProducts({ slug }));
  }, [dispatch, slug]);

  const reload = useCallback(() => {
    void dispatch(fetchCategoryProducts({ slug, force: true }));
  }, [dispatch, slug]);

  return { products: list.items, status: list.status, error: list.error, reload };
}
