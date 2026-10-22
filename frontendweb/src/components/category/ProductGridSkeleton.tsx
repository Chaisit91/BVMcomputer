import { Skeleton } from '../ui/Skeleton';
import type { CategoryView } from './categoryListing';

/** Loading placeholder matching the product grid/list layout, so the page doesn't jump when data arrives. */
export function ProductGridSkeleton({ view = 'grid', count = 8 }: { view?: CategoryView; count?: number }) {
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="กำลังโหลดสินค้า">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4">
            <Skeleton className="h-24 w-24 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-auto h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="กำลังโหลดสินค้า">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}
