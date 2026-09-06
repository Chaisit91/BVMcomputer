import { useMemo, useState } from 'react';
import { Container } from '../components/ui/Container';
import { CpuHeroBanner } from '../components/category/CpuHeroBanner';
import { FilterSidebar, type CategorySort, type CategoryView } from '../components/category/FilterSidebar';
import { CategoryProductCard } from '../components/category/CategoryProductCard';
import { CategoryProductListRow } from '../components/category/CategoryProductListRow';
import { ProductPagination } from '../components/category/ProductPagination';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import {
  applyCpuFilters,
  cpuProducts,
  CPU_PRICE_CEILING,
  defaultCpuFilters,
  type CpuFilterState,
} from '../data/cpuProducts';

// Mock dataset only has 12 items, but the storefront's real catalog is much bigger —
// this decorative page count stands in until the backend exposes real pagination.
const MOCK_PAGE_SIZE = 12;
const MOCK_TOTAL_ITEMS = 104;

export function CpuCategoryPage() {
  const [filters, setFilters] = useState<CpuFilterState>(defaultCpuFilters);
  const [sort, setSort] = useState<CategorySort>('popular');
  const [view, setView] = useState<CategoryView>('grid');
  const [page, setPage] = useState(1);

  // Pure derived data — no side effect involved, so useMemo (not useEffect) is the right tool.
  const visibleProducts = useMemo(() => {
    const filtered = applyCpuFilters(cpuProducts, filters);
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [filters, sort]);

  return (
    <>
      <CpuHeroBanner />

      <section id="cpu-products" className="bg-slate-50 py-8">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <FilterSidebar
              title="ซีพียู"
              count={visibleProducts.length}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              priceCeiling={CPU_PRICE_CEILING}
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(defaultCpuFilters)}
            />

            <div className="min-w-0 flex-1">
              {visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
                  ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <CategoryProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visibleProducts.map((product) => (
                    <CategoryProductListRow key={product.id} product={product} />
                  ))}
                </div>
              )}

              <ProductPagination
                currentPage={page}
                totalPages={Math.ceil(MOCK_TOTAL_ITEMS / MOCK_PAGE_SIZE)}
                pageSize={MOCK_PAGE_SIZE}
                totalItems={MOCK_TOTAL_ITEMS}
                onPageChange={setPage}
              />
            </div>
          </div>
        </Container>
      </section>

      <ServiceBadges />
    </>
  );
}
