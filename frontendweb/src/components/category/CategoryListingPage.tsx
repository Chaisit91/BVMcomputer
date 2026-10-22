import { useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Container } from '../ui/Container';
import { ErrorState } from '../ui/ErrorState';
import { ProductPagination } from './ProductPagination';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { useCategoryProducts } from '../../hooks/useCategoryProducts';
import { sortByPrice, type CategoryFilterSidebarProps, type CategorySort, type CategoryView } from './categoryListing';
import type { CategoryProductMap, ProductCategorySlug } from '../../data/catalog';

const PAGE_SIZE = 12;

interface CategoryListingPageProps<K extends ProductCategorySlug, F> {
  slug: K;
  /** Heading shown in the sidebar, e.g. "ซีพียู". */
  title: string;
  sectionId: string;
  hero: ReactNode;
  Sidebar: ComponentType<CategoryFilterSidebarProps<F>>;
  Card: ComponentType<{ product: CategoryProductMap[K] }>;
  Row: ComponentType<{ product: CategoryProductMap[K] }>;
  defaultFilters: F;
  applyFilters: (products: CategoryProductMap[K][], filters: F) => CategoryProductMap[K][];
  priceCeiling: number;
}

/**
 * Shared layout + behaviour for every category page: loads the category from the
 * backend (via Redux), then filters, sorts and paginates it. Each category page only
 * supplies its own hero, sidebar, card/row components and filter function.
 */
export function CategoryListingPage<K extends ProductCategorySlug, F>({
  slug,
  title,
  sectionId,
  hero,
  Sidebar,
  Card,
  Row,
  defaultFilters,
  applyFilters,
  priceCeiling,
}: CategoryListingPageProps<K, F>) {
  const { products, status, error, reload } = useCategoryProducts(slug);
  const [filters, setFilters] = useState<F>(defaultFilters);
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
  const handleFiltersChange = (next: F) => {
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
              <Card key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pageProducts.map((product) => (
              <Row key={product.id} product={product} />
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
      {hero}

      <section ref={sectionRef} id={sectionId} className="scroll-mt-20 bg-slate-50 pb-16 pt-8">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <Sidebar
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
