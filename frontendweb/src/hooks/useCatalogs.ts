import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCategoriesProducts } from '../features/catalog/catalogSlice';
import type { CategoryProductMap, ProductCategorySlug } from '../data/catalog';
import type { RequestStatus } from '../types/api';

interface UseCatalogsResult<K extends ProductCategorySlug> {
  catalogs: { [P in K]: CategoryProductMap[P][] };
  /** Combined status: failed if any list failed, loading until every list has arrived. */
  status: RequestStatus;
  error: string | null;
  reload: () => void;
}

/**
 * Several category lists at once, fetched in parallel (Promise.all inside
 * fetchCategoriesProducts). Pass a module-level constant array so the effect
 * doesn't re-run on every render.
 */
export function useCatalogs<K extends ProductCategorySlug>(slugs: readonly K[]): UseCatalogsResult<K> {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector((state) => state.catalog);

  useEffect(() => {
    void dispatch(fetchCategoriesProducts({ slugs: [...slugs] }));
  }, [dispatch, slugs]);

  const reload = useCallback(() => {
    void dispatch(fetchCategoriesProducts({ slugs: [...slugs], force: true }));
  }, [dispatch, slugs]);

  return useMemo(() => {
    const lists = slugs.map((slug) => catalog[slug]);
    const failed = lists.find((list) => list.status === 'failed');
    const status: RequestStatus = failed
      ? 'failed'
      : lists.every((list) => list.status === 'succeeded')
        ? 'succeeded'
        : 'loading';

    const catalogs = Object.fromEntries(slugs.map((slug) => [slug, catalog[slug].items])) as {
      [P in K]: CategoryProductMap[P][];
    };

    return { catalogs, status, error: failed?.error ?? null, reload };
  }, [catalog, slugs, reload]);
}
