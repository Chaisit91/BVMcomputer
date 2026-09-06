import { BsCpu } from 'react-icons/bs';
import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import type { CpuBadge, CpuProduct } from '../../data/cpuProducts';
import { formatTHB } from '../../lib/format';

const badgeStyle: Record<CpuBadge, string> = {
  แนะนำ: 'bg-ink text-white',
  สินค้าขายดี: 'bg-brand text-white',
  ใหม่: 'bg-amber-400 text-ink',
};

/** Horizontal row layout for the product list view (as opposed to the card grid). */
export function CategoryProductListRow({ product }: { product: CpuProduct }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({ id: product.id, name: product.name, slug: product.id, price: product.price, category: 'cpu' }),
    );
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-card">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        {product.badge && (
          <span
            className={`absolute -left-1 -top-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-sm ${badgeStyle[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        <BsCpu size={34} className="text-slate-300" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-ink">{product.name}</h3>
        <p className="text-xs text-slate-400">
          {product.cores}C/{product.threads}T | {product.clock} · {product.socket}
        </p>
        {!product.inStock && <p className="mt-0.5 text-[11px] font-medium text-slate-500">สั่งจอง</p>}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-base font-bold text-brand">{formatTHB(product.price)}</span>
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <FiShoppingCart size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
