import { useMemo, useRef, useState } from 'react';
import { Container } from '../ui/Container';
import { ErrorState } from '../ui/ErrorState';
import { ProductPagination } from './ProductPagination';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { CategoryHeroBanner } from './CategoryHeroBanner';
import { CategoryFilterSidebar } from './CategoryFilterSidebar';
import { CategoryProductCard } from './CategoryProductCard';
import { CategoryProductListRow } from './CategoryProductListRow';
import { categoryConfigs, type CategoryConfig, type CategoryFilterMap } from './categoryConfigs';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { sortByPrice, type CategorySort, type CategoryView } from './categoryListing';
import type { ProductCategorySlug } from '../../data/catalog';

const PAGE_SIZE = 12;

/**
 * Shared layout + behaviour for every category page: loads the category from the
 * backend (via Redux), then filters, sorts and paginates it. Everything that differs
 * per category (hero text, filter groups, card spec lines, icon) lives in categoryConfigs.
 */
export function CategoryListingPage<K extends ProductCategorySlug>({ slug }: { slug: K }) {
  const config: CategoryConfig<K> = categoryConfigs[slug];
  const { title, sectionId, hero } = config;
  const { defaults: defaultFilters, apply: applyFilters, priceCeiling, sections } = config.filters;

  const { products, status, error, reload } = useCategoryProducts(slug);
  const [filters, setFilters] = useState<CategoryFilterMap[K]>(defaultFilters);
  const [sort, setSort] = useState<CategorySort>('popular');
  const [view, setView] = useState<CategoryView>('grid');
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  // Pure derived data — no side effect involved, so useMemo (not useEffect) is the right tool.
  const visibleProducts = useMemo(
    () => sortByPrice(applyFilters(products, filters), sort),
    [applyFilters, products, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = visibleProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Any change to what's being shown starts back at page 1.
  const handleFiltersChange = (next: CategoryFilterMap[K]) => {
    setFilters(next);
    setPage(1);
  };
  const handleSortChange = (next: CategorySort) => {
    setSort(next);
    setPage(1);
  };
  const handlePageChange = (next: number) => {
    setPage(next);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isInitialLoad = (status === 'idle' || status === 'loading') && products.length === 0;

  const renderBody = () => {
    if (isInitialLoad) return <ProductGridSkeleton view={view} />;
    if (status === 'failed' && products.length === 0) return <ErrorState message={error} onRetry={reload} />;
    if (visibleProducts.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
          ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก
        </div>
      );
    }
    return (
      <>
        {view === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pageProducts.map((product) => (
              <CategoryProductCard key={product.id} slug={slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pageProducts.map((product) => (
              <CategoryProductListRow key={product.id} slug={slug} product={product} />
            ))}
          </div>
        )}

        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={visibleProducts.length}
          onPageChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <>
      <CategoryHeroBanner icon={config.icon} {...hero} />

      <section ref={sectionRef} id={sectionId} className="scroll-mt-20 bg-slate-50 pb-16 pt-8">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <CategoryFilterSidebar
              sections={sections}
              title={title}
              count={visibleProducts.length}
              sort={sort}
              onSortChange={handleSortChange}
              view={view}
              onViewChange={setView}
              priceCeiling={priceCeiling}
              filters={filters}
              onChange={handleFiltersChange}
              onClear={() => handleFiltersChange(defaultFilters)}
            />

            <div className="min-w-0 flex-1">{renderBody()}</div>
          </div>
        </Container>
      </section>
    </>
  );
}
