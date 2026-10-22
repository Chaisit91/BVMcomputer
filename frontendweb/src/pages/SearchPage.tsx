import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductGridSkeleton } from '../components/category/ProductGridSkeleton';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { runSearch } from '../features/search/searchSlice';

const MIN_QUERY_LENGTH = 2;

export function SearchPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const { results, status, error, query: lastQuery } = useAppSelector((state) => state.search);

  const search = useCallback(() => {
    if (query.length >= MIN_QUERY_LENGTH) void dispatch(runSearch(query));
  }, [dispatch, query]);

  // Real side effect: search whenever the ?q= in the URL changes (header search, back/forward).
  useEffect(() => {
    search();
  }, [search]);

  const isCurrent = lastQuery === query;

  const renderBody = () => {
    if (query.length < MIN_QUERY_LENGTH) {
      return <EmptyState icon={FiSearch} title="พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหาสินค้า" />;
    }
    if (!isCurrent || status === 'loading' || status === 'idle') return <ProductGridSkeleton />;
    if (status === 'failed') return <ErrorState message={error} onRetry={search} />;
    if (results.length === 0) {
      return (
        <EmptyState
          icon={FiSearch}
          title={`ไม่พบสินค้าสำหรับ "${query}"`}
          description="ลองใช้คำค้นหาอื่น หรือตรวจสอบการสะกดอีกครั้ง"
        />
      );
    }
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {results.map((product) => (
          <SearchResultCard key={`${product.categorySlug}-${product.id}`} product={product} />
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="bg-slate-50 pb-16 pt-8">
        <Container>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-lg font-bold text-ink sm:text-xl">
              {query ? (
                <>
                  ผลการค้นหา <span className="text-brand">"{query}"</span>
                </>
              ) : (
                'ค้นหาสินค้า'
              )}
            </h1>
            {isCurrent && status === 'succeeded' && results.length > 0 && (
              <span className="text-sm text-slate-400">พบ {results.length} รายการ</span>
            )}
          </div>
          {renderBody()}
        </Container>
      </section>
    </>
  );
}
