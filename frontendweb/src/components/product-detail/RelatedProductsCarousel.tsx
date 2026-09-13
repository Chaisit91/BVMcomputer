import { useLayoutEffect, useRef, useState } from 'react';
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

// Must match the card's own w-56 and the row's gap-4 below.
const CARD_WIDTH = 224;
const GAP = 16;

export function RelatedProductsCarousel({ items, fallbackIcon: Icon }: RelatedProductsCarouselProps) {
  const dispatch = useAppDispatch();
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [visibleWidth, setVisibleWidth] = useState<number | null>(null);

  // Cap the visible row to a width that only ever shows whole cards — otherwise a
  // partially-cut card sits right at the edge next to the arrow button.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateWidth = () => {
      const available = el.offsetWidth;
      const cardsThatFit = Math.max(1, Math.floor((available + GAP) / (CARD_WIDTH + GAP)));
      setVisibleWidth(cardsThatFit * (CARD_WIDTH + GAP) - GAP);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animated by hand (rather than the native `scrollBy({ behavior: 'smooth' })`) so the
  // slide is always visible and consistent — native smooth-scroll is skipped entirely by
  // some browsers/OS "reduce motion" settings, which made the row appear to just snap to
  // new products instead of sliding over.
  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;

    const distance = direction * (CARD_WIDTH + GAP);
    const start = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = Math.min(Math.max(start + distance, 0), maxScroll);
    const change = target - start;
    const duration = 320;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      el.scrollLeft = start + change * eased;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (items.length === 0) return null;

  return (
    // Outer div spans the full available width purely so its size can be measured;
    // the inner div is what's actually capped to a whole-card width and holds the
    // arrow buttons, so they anchor to the visible cards' true edge, not blank space.
    <div ref={viewportRef} className="w-full">
      <div className="relative" style={{ width: visibleWidth ?? '100%' }}>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
          className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-colors hover:bg-brand-dark sm:flex"
        >
          <FiChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="เลื่อนขวา"
          onClick={() => scrollByCard(1)}
          className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-colors hover:bg-brand-dark sm:flex"
        >
          <FiChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
