import { useRef } from 'react';
import type { IconType } from 'react-icons';
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { formatTHB } from '../../lib/format';
import { toCartCategoryKey, type RelatedProductSummary } from '../../data/productLookup';

interface RelatedProductsCarouselProps {
  items: RelatedProductSummary[];
  fallbackIcon: IconType;
}

export function RelatedProductsCarousel({ items, fallbackIcon: Icon }: RelatedProductsCarouselProps) {
  const dispatch = useAppDispatch();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: 'thin' }}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.categorySlug}/${item.id}`}
            className="flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card"
          >
            <div className="flex aspect-square items-center justify-center bg-slate-50">
              <Icon size={48} className="text-slate-300" aria-hidden="true" />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="line-clamp-2 min-h-[2.25rem] text-sm font-medium text-ink">{item.name}</h3>
              <p className="line-clamp-1 text-xs text-slate-400">{item.shortDetail}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <span className="text-sm font-bold text-brand">{formatTHB(item.price)}</span>
                <button
                  type="button"
                  aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(
                      addToCart({
                        id: item.id,
                        name: item.name,
                        slug: item.id,
                        price: item.price,
                        category: toCartCategoryKey(item.categorySlug),
                      }),
                    );
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
                >
                  <FiShoppingCart size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="เลื่อนซ้าย"
        onClick={() => scrollByCard(-1)}
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 sm:flex"
      >
        <FiChevronLeft size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="เลื่อนขวา"
        onClick={() => scrollByCard(1)}
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 sm:flex"
      >
        <FiChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
