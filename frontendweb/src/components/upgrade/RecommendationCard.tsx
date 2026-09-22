import type { IconType } from 'react-icons';
import { FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';
import type { UpgradeProduct } from '../../types/upgrade';

export interface RecommendationItem {
  product: UpgradeProduct;
  icon: IconType;
  badgeLabel: string;
  badgeClassName: string;
  reasons: string[];
}

/**
 * One card in step 3's "AI recommendation" panel (right column). Reused across all three
 * tabs — only the badge wording/color and the reasons list change per tab.
 */
export function RecommendationCard({ product, icon: Icon, badgeLabel, badgeClassName, reasons }: RecommendationItem) {
  return (
    <article className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <Icon size={28} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className={cn('inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold', badgeClassName)}>{badgeLabel}</span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</h3>
        <p className="truncate text-xs text-slate-400">{product.specifications.slice(0, 2).join(' · ')}</p>

        <ul className="mt-1.5 flex flex-col gap-0.5">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-1.5 text-xs text-slate-500">
              <FiCheck size={12} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-brand">{formatTHB(product.price)}</span>
          <Link
            to={`/product/${product.category}/${product.productId}`}
            className="rounded-md border border-brand px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-red-50"
          >
            ดูสินค้า
          </Link>
        </div>
      </div>
    </article>
  );
}
