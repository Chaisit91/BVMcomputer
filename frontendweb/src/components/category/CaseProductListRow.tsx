import { BsWindow } from 'react-icons/bs';
import { FiLayout, FiShoppingCart } from 'react-icons/fi';
import { PiComputerTower } from 'react-icons/pi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import type { CaseBadge, CaseProduct } from '../../data/caseProducts';
import { formatTHB } from '../../lib/format';
import { FavoriteButton } from '../ui/FavoriteButton';
import { SpecChip } from '../ui/SpecChip';

const badgeStyle: Record<CaseBadge, string> = {
  แนะนำ: 'bg-ink text-white',
  สินค้าขายดี: 'bg-brand text-white',
  ใหม่: 'bg-amber-400 text-ink',
};

/** Horizontal row layout for the product list view (as opposed to the card grid). */
export function CaseProductListRow({ product }: { product: CaseProduct }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({ id: product.id, name: product.name, slug: product.id, price: product.price, category: 'case' }),
    );
  };

  return (
    <div className="relative flex min-h-[132px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-card">
      <FavoriteButton label={`เพิ่ม ${product.name} ในรายการโปรด`} />

      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-2">
        {product.badge && (
          <span
            className={`absolute -left-1 -top-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-sm ${badgeStyle[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <PiComputerTower size={44} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-base font-bold text-ink sm:text-lg">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-400">
          {product.brand} | {product.formFactor}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <SpecChip icon={PiComputerTower} label={product.caseType} />
          <SpecChip icon={FiLayout} label={product.formFactor} />
          <SpecChip icon={BsWindow} label={product.sidePanel} />
        </div>
      </div>

      {/* Lower-right, offset (mb) up from the flex row's bottom edge — pinned by
          self-end so it stays put regardless of the product name's length, and
          kept well clear of the wishlist button above it. */}
      <div className="mb-2.5 flex shrink-0 items-center gap-3 self-end">
        <span className="whitespace-nowrap text-lg font-bold text-brand">{formatTHB(product.price)}</span>
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <FiShoppingCart size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
