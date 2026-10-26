import type { IconType } from 'react-icons';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export interface CategoryFeatureItem {
  id: string;
  title: string;
  subtitle: string;
  /** Real category route, e.g. "/category/cpu". */
  to: string;
  icon: IconType;
}

/**
 * One homepage category card — horizontal: icon, Thai name + English label, arrow, all vertically
 * centered. The whole card is the link; every card shares the same height, padding and alignment.
 */
export function CategoryFeatureCard({ item }: { item: CategoryFeatureItem }) {
  return (
    <Link
      to={item.to}
      className="group flex min-h-[76px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors duration-200 hover:border-brand/40 hover:bg-red-50/40 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 sm:gap-3 sm:px-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-red-50 text-brand sm:h-11 sm:w-11">
        <item.icon className="h-[22px] w-[22px]" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="text-sm font-semibold leading-snug text-ink sm:text-[15px]">{item.title}</span>
        <span className="truncate text-[11px] font-medium uppercase leading-none tracking-wide text-slate-400 sm:text-xs">
          {item.subtitle}
        </span>
      </span>

      <FiChevronRight
        size={18}
        className="shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand"
        aria-hidden="true"
      />
    </Link>
  );
}
