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
}

/**
 * One replacement-part option in step 2. The whole card toggles the pick (click again
 * to un-pick); the cart icon is the one thing that doesn't, so it stops propagation.
 */
export function UpgradeProductCard({ product, icon: Icon, selected, onToggle, onAddToCart }: UpgradeProductCardProps) {
  const primarySpecs = product.specifications.slice(0, 2).join(' · ');
  const secondarySpecs = product.specifications.slice(2).join(' · ');

  return (
    <article
      onClick={onToggle}
      className={cn(
        'flex cursor-pointer flex-col rounded-xl border p-3 transition-shadow',
        selected ? 'border-brand bg-red-50/50 ring-1 ring-brand/30' : 'border-slate-200 bg-white hover:shadow-card',
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-white p-2">
        {selected && (
          <span className="absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-sm">
            <FiCheck size={14} strokeWidth={3} aria-hidden="true" />
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
        className={cn(
          'mt-2 h-9 w-full rounded-md border text-sm font-semibold transition-colors',
          selected
            ? 'border-brand bg-brand text-white'
            : 'border-brand bg-white text-brand hover:bg-red-50',
        )}
      >
        {selected ? 'เลือกแล้ว' : 'เลือกสินค้า'}
      </button>
    </article>
  );
}
