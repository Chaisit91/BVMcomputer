import type { IconType } from 'react-icons';
import { FiCheck, FiCheckCircle, FiRepeat, FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';
import type { RecommendationTier, UpgradeProduct } from '../../types/upgrade';

const tierBadge: Record<RecommendationTier, string> = {
  primary: 'bg-brand text-white',
  sequential: 'bg-slate-700 text-white',
  skip: 'bg-slate-100 text-slate-500',
};

interface RecommendationCardProps {
  product: UpgradeProduct;
  icon: IconType;
  tier: RecommendationTier;
  /** The recommendation's own tag, e.g. "แนะนำที่สุด". */
  label: string;
  /** "AI แนะนำ" for real AI output, "แนะนำ (Demo)" for the mock engine — never claims AI when it isn't. */
  sourceLabel: string;
  reasons: string[];
  /** This exact product is the upgrade in effect for its category right now. */
  selected: boolean;
  /**
   * True when it was chosen on step 3, so a second click removes it (and the step-2 product returns).
   * A selected step-2 product isn't removable here — it shows "เลือกแล้ว" without the cancel action.
   */
  canDeselect: boolean;
  /** Select (or replace the category's pick); when deselectable, deselects. */
  onToggle: () => void;
}

/**
 * One card in step 3's recommendation panel. "Recommended" (the badges) and "selected" (red
 * border + เลือกแล้ว) are separate states: a card can be recommended without being chosen.
 */
export function RecommendationCard({
  product,
  icon: Icon,
  tier,
  label,
  sourceLabel,
  reasons,
  selected,
  canDeselect,
  onToggle,
}: RecommendationCardProps) {
  // "Not needed" items are the customer's current part — there's nothing to switch to.
  const canSelect = tier !== 'skip';

  return (
    <article
      className={cn(
        'rounded-xl border bg-white p-3 transition-colors',
        selected ? 'border-brand ring-1 ring-brand/30' : 'border-slate-200',
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <Icon size={28} className="text-slate-300" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', tierBadge[tier])}>{label}</span>
            {canSelect && (
              <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">{sourceLabel}</span>
            )}
            {selected && (
              <span className="flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                <FiCheckCircle size={10} aria-hidden="true" />
                เลือกแล้ว
              </span>
            )}
          </div>
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

          <p className="mt-1.5 text-sm font-bold text-brand">{formatTHB(product.price)}</p>
        </div>
      </div>

      <div className={cn('mt-2.5 grid gap-2', canSelect ? 'grid-cols-2' : 'grid-cols-1')}>
        {canSelect &&
          (selected && !canDeselect ? (
            // The product picked in step 2 — selected, but step 3 never removes it.
            <span
              title="สินค้าที่คุณเลือกไว้ใน STEP 2"
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-600"
            >
              <FiCheck size={14} aria-hidden="true" />
              เลือกแล้ว
            </span>
          ) : selected ? (
            // Pressing again deselects. Hover swaps the label to say so; on touch the title/aria-label carry it.
            <button
              type="button"
              onClick={onToggle}
              aria-pressed="true"
              aria-label={`เลือกแล้ว — กดเพื่อยกเลิกการเลือก ${product.name}`}
              title="กดอีกครั้งเพื่อยกเลิกการเลือก"
              className="group flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-brand"
            >
              <FiCheck size={14} className="group-hover:hidden" aria-hidden="true" />
              <FiX size={14} className="hidden group-hover:block" aria-hidden="true" />
              <span className="group-hover:hidden">เลือกแล้ว</span>
              <span className="hidden group-hover:inline">ยกเลิกการเลือก</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              aria-pressed="false"
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-brand text-xs font-semibold text-brand transition-colors hover:bg-red-50"
            >
              <FiRepeat size={14} aria-hidden="true" />
              เปลี่ยนสินค้า
            </button>
          ))}
        <Link
          to={`/product/${product.category}/${product.productId}`}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <FiSearch size={14} aria-hidden="true" />
          ดูสินค้า
        </Link>
      </div>
    </article>
  );
}
