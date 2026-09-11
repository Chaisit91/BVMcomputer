import { useState } from 'react';
import type { IconType } from 'react-icons';
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';

interface ProductGalleryProps {
  imageUrl?: string;
  fallbackIcon: IconType;
  productName: string;
}

// No multi-angle photography yet (mockup phase) — this stands in with repeated
// slots of the same image/fallback icon so the gallery layout is fully built
// and only needs real photo URLs swapped in later.
const THUMBNAIL_COUNT = 4;

export function ProductGallery({ imageUrl, fallbackIcon: Icon, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (offset: number) => {
    setActiveIndex((current) => (current + offset + THUMBNAIL_COUNT) % THUMBNAIL_COUNT);
  };

  return (
    <div className="flex gap-3">
      <div className="hidden shrink-0 flex-col gap-2 sm:flex">
        {Array.from({ length: THUMBNAIL_COUNT }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`รูปสินค้า ${index + 1}`}
            aria-current={index === activeIndex}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-lg border bg-white transition-colors',
              index === activeIndex ? 'border-brand ring-2 ring-brand/20' : 'border-slate-200 hover:border-slate-300',
            )}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full rounded-lg object-contain p-1" />
            ) : (
              <Icon size={26} className="text-slate-300" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <div className="relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
        <button
          type="button"
          aria-label="ดูรูปขยาย"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
        >
          <FiMaximize2 size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="รูปก่อนหน้า"
          onClick={() => goTo(-1)}
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
        >
          <FiChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="รูปถัดไป"
          onClick={() => goTo(1)}
          className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
        >
          <FiChevronRight size={18} aria-hidden="true" />
        </button>

        {imageUrl ? (
          <img src={imageUrl} alt={productName} className="h-full w-full object-contain" />
        ) : (
          <Icon size={140} className="text-slate-200" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
