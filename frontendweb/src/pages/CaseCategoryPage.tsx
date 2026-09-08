import { useMemo, useState } from 'react';
import { Container } from '../components/ui/Container';
import { CaseHeroBanner } from '../components/category/CaseHeroBanner';
import { CaseFilterSidebar, type CategorySort, type CategoryView } from '../components/category/CaseFilterSidebar';
import { CaseProductCard } from '../components/category/CaseProductCard';
import { CaseProductListRow } from '../components/category/CaseProductListRow';
import { ProductPagination } from '../components/category/ProductPagination';
import { ServiceBadges } from '../components/shared/ServiceBadges';
import {
  applyCaseFilters,
  caseProducts,
  CASE_PRICE_CEILING,
  defaultCaseFilters,
  type CaseFilterState,
} from '../data/caseProducts';

// Mock dataset only has 12 items, but the storefront's real catalog is much bigger —
// this decorative page count stands in until the backend exposes real pagination.
const MOCK_PAGE_SIZE = 12;
const MOCK_TOTAL_ITEMS = 58;

export function CaseCategoryPage() {
  const [filters, setFilters] = useState<CaseFilterState>(defaultCaseFilters);
  const [sort, setSort] = useState<CategorySort>('popular');
  const [view, setView] = useState<CategoryView>('grid');
  const [page, setPage] = useState(1);

  // Pure derived data — no side effect involved, so useMemo (not useEffect) is the right tool.
  const visibleProducts = useMemo(() => {
    const filtered = applyCaseFilters(caseProducts, filters);
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [filters, sort]);

  return (
    <>
      <CaseHeroBanner />

      <section id="case-products" className="bg-slate-50 pb-0 pt-8">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <CaseFilterSidebar
              title="เคส"
              count={visibleProducts.length}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              priceCeiling={CASE_PRICE_CEILING}
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(defaultCaseFilters)}
            />

            <div className="min-w-0 flex-1">
              {visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
                  ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <CaseProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visibleProducts.map((product) => (
                    <CaseProductListRow key={product.id} product={product} />
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
