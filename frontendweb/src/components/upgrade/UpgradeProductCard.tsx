import type { IconType } from 'react-icons';
import { FiCheck, FiShoppingCart } from 'react-icons/fi';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';
import type { UpgradeProduct } from '../../types/upgrade';

interface UpgradeProductCardProps {
  product: UpgradeProduct;
  /** Category icon — only used when the product has no photo yet. */
  icon: IconType;
  selected: boolean;
  onToggle: () => void;
  onAddToCart: () => void;
  /** Optional tag in the image corner, e.g. "AI แนะนำ" (step 3). */
  badge?: string;
  /** The customer already owns this exact part — nothing to upgrade to, so it can't be picked. */
  isCurrentPart?: boolean;
  /** When selected, keep it selected — clicking doesn't deselect (e.g. the step-2 product shown on step 3). */
  lockSelection?: boolean;
}

/**
 * One replacement-part option (step 2 grid, step 3 "สินค้าที่แนะนำสำหรับคุณ"). Clicking the card
 * calls onToggle — select, replace, or (clicking the selected one again) deselect. The cart icon
 * is the one thing that doesn't, so it stops propagation.
 */
export function UpgradeProductCard({
  product,
  icon: Icon,
  selected,
  onToggle,
  onAddToCart,
  badge,
  isCurrentPart = false,
  lockSelection = false,
}: UpgradeProductCardProps) {
  const primarySpecs = product.specifications.slice(0, 2).join(' · ');
  const secondarySpecs = product.specifications.slice(2).join(' · ');
  const isLocked = isCurrentPart || (selected && lockSelection);

  return (
    <article
      onClick={isLocked ? undefined : onToggle}
      title={selected && lockSelection ? 'สินค้าที่คุณเลือกไว้ใน STEP 2' : undefined}
      className={cn(
        'flex flex-col rounded-xl border p-3 transition-shadow',
        isLocked ? 'cursor-default' : 'cursor-pointer',
        selected ? 'border-brand bg-red-50/50 ring-1 ring-brand/30' : 'border-slate-200 bg-white hover:shadow-card',
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-white p-2">
        {selected && (
          <span className="absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <FiCheck size={14} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
        {badge && (
          <span className="absolute right-1 top-1 z-10 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            {badge}
          </span>
        )}
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <Icon size={56} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink">{product.name}</h3>
      <p className="mt-1 truncate text-xs text-slate-400">{primarySpecs}</p>
      <p className="min-h-[1rem] truncate text-xs text-slate-400">{secondarySpecs}</p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-base font-bold text-brand">{formatTHB(product.price)}</span>
        <button
          type="button"
          aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-slate-100 hover:text-brand"
        >
          <FiShoppingCart size={16} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        disabled={isLocked}
        className={cn(
          'mt-2 h-9 w-full rounded-md border text-sm font-semibold transition-colors',
          isCurrentPart
            ? 'cursor-default border-slate-200 bg-slate-50 text-slate-400'
            : selected
              ? 'border-brand bg-brand text-white'
              : 'border-brand bg-white text-brand hover:bg-red-50',
        )}
      >
        {isCurrentPart ? 'สเปคปัจจุบันของคุณ' : selected ? 'เลือกแล้ว' : 'เลือกสินค้า'}
      </button>
    </article>
  );
}
