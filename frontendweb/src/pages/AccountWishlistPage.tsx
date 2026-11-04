import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsHeartFill } from 'react-icons/bs';
import { FiAlertCircle, FiHeart, FiInfo, FiSearch } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { RequireLogin } from '../components/account/RequireLogin';
import { WishlistProductCard, type WishlistItemView } from '../components/account/WishlistProductCard';
import { ProductPagination } from '../components/category/ProductPagination';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch } from '../app/hooks';
import { useCatalogs } from '../hooks/useCatalogs';
import { useWishlist } from '../hooks/useWishlist';
import { clearWishlistError } from '../features/wishlist/wishlistSlice';
import { productSpecLine, toCartProduct } from '../data/productSummary';
import type { CatalogLists, CategoryProductMap, ProductCategorySlug } from '../data/catalog';
import type { WishlistEntry } from '../types/api';

type WishlistSort = 'latest' | 'price-asc' | 'price-desc';

const PAGE_SIZE = 6;

const sortOptions: { value: WishlistSort; label: string }[] = [
  { value: 'latest', label: 'ล่าสุด' },
  { value: 'price-asc', label: 'ราคาต่ำไปสูง' },
  { value: 'price-desc', label: 'ราคาสูงไปต่ำ' },
];

/** Joins an entry with its live catalog product; null if the product is no longer listed. */
function toItemView(entry: WishlistEntry, catalogs: Partial<CatalogLists>): WishlistItemView | null {
  const list = catalogs[entry.category] as CategoryProductMap[ProductCategorySlug][] | undefined;
  const product = list?.find((p) => p.id === entry.productId);
  if (!product) return null;
  return {
    entry,
    name: product.name,
    specLine: productSpecLine(entry.category, product),
    price: product.price,
    inStock: product.inStock,
    imageUrl: product.imageUrl,
    cartProduct: toCartProduct(entry.category, product),
  };
}

/** "รายการของฉัน › สินค้าที่ถูกใจ" — saved products with search, sort, add-to-cart and remove. */
export function AccountWishlistPage() {
  return (
    <RequireLogin>
      <WishlistContent />
    </RequireLogin>
  );
}

function WishlistContent() {
  const dispatch = useAppDispatch();
  const wishlist = useWishlist();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<WishlistSort>('latest');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Only the categories that actually hold saved products are loaded (in parallel). The joined
  // string keeps the array stable between renders, so useCatalogs doesn't refetch.
  const slugKey = [...new Set(wishlist.entries.map((entry) => entry.category))].sort().join(',');
  const slugs = useMemo(() => (slugKey ? (slugKey.split(',') as ProductCategorySlug[]) : []), [slugKey]);
  const { catalogs, status: catalogStatus, error: catalogError, reload: reloadCatalogs } = useCatalogs(slugs);

  const items = useMemo(
    () => wishlist.entries.map((entry) => toItemView(entry, catalogs)).filter((item): item is WishlistItemView => item !== null),
    [wishlist.entries, catalogs],
  );

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const matched = keyword
      ? items.filter((item) => `${item.name} ${item.specLine} ${item.cartProduct.brand ?? ''}`.toLowerCase().includes(keyword))
      : items;
    const sorted = [...matched];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => b.entry.addedAt.localeCompare(a.entry.addedAt));
    return sorted;
  }, [items, query, sort]);

  // Pages follow the list: removing items so the current page empties falls back to the last page
  // that still has products; adding a 7th item makes page 2 available.
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  // A new search or sort starts back at page 1.
  const handleQueryChange = (next: string) => {
    setQuery(next);
    setPage(1);
  };
  const handleSortChange = (next: WishlistSort) => {
    setSort(next);
    setPage(1);
  };

  const isLoading =
    wishlist.status === 'idle' || wishlist.status === 'loading' || (wishlist.entries.length > 0 && catalogStatus === 'loading');

  const renderBody = () => {
    if (wishlist.status === 'failed') return <ErrorState message={wishlist.error} onRetry={wishlist.reload} />;
    if (catalogStatus === 'failed') return <ErrorState message={catalogError} onRetry={reloadCatalogs} />;
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[340px] rounded-2xl" />
          ))}
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon={FiHeart}
          title="ยังไม่มีสินค้าที่ถูกใจ"
          description="กดรูปหัวใจบนสินค้าที่สนใจ เพื่อบันทึกไว้เลือกซื้อภายหลัง"
          action={
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              กลับไปเลือกซื้อสินค้า
            </Link>
          }
        />
      );
    }
    if (visibleItems.length === 0) {
      return (
        <EmptyState
          icon={FiSearch}
          title="ไม่พบสินค้าที่ตรงกับคำค้นหา"
          description={`ไม่มีสินค้าในรายการโปรดที่ตรงกับ “${query.trim()}”`}
          action={
            <button type="button" onClick={() => handleQueryChange('')} className="text-sm font-semibold text-brand hover:text-brand-dark">
              ล้างคำค้นหา
            </button>
          }
        />
      );
    }
    return (
      <div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((item) => (
            <WishlistProductCard key={`${item.entry.category}:${item.entry.productId}`} item={item} />
          ))}
        </div>
        <ProductPagination
          variant="outline"
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={visibleItems.length}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  return (
    <AccountLayout
      title="รายการสินค้าที่ถูกใจ"
      icon={BsHeartFill}
      description="สินค้าที่บันทึกไว้เพื่อเลือกซื้อภายหลัง"
      actions={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
          <label className="relative block sm:flex-1 xl:w-72 xl:flex-none">
            <span className="sr-only">ค้นหาสินค้าที่ถูกใจ</span>
            <FiSearch size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="ค้นหาสินค้าที่ถูกใจ..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <span className="shrink-0">เรียงตาม:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as WishlistSort)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none sm:w-40"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      {wishlist.mutationError && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand">
          <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
          {wishlist.mutationError}
          <button type="button" onClick={() => dispatch(clearWishlistError())} className="ml-auto text-xs font-semibold underline">
            ปิด
          </button>
        </p>
      )}

      {wishlist.source === 'demo' && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <FiInfo size={16} className="shrink-0" aria-hidden="true" />
          โหมดทดลอง: ยังไม่ได้เชื่อมต่อระบบ รายการโปรดบันทึกไว้ในเบราว์เซอร์นี้เท่านั้น
        </p>
      )}

      <div ref={listRef} className="flex scroll-mt-24 flex-col gap-4">
        {!isLoading && items.length > 0 && (
          <p className="text-sm text-ink">
            สินค้าที่ถูกใจ <span className="font-bold">{items.length}</span> รายการ
            {query.trim() && visibleItems.length !== items.length && (
              <span className="text-slate-400"> · ตรงกับคำค้นหา {visibleItems.length} รายการ</span>
            )}
          </p>
        )}
        {renderBody()}
      </div>
    </AccountLayout>
  );
}
