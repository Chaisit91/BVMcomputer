import { BsCpu } from 'react-icons/bs';
import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import type { CpuBadge, CpuProduct } from '../../data/cpuProducts';
import { formatTHB } from '../../lib/format';
import { FavoriteButton } from '../ui/FavoriteButton';

// This page's own badge wording ("สินค้าขายดี" etc.) differs from the shared
// homepage Badge component's fixed labels, so it gets its own small badge here.
const badgeStyle: Record<CpuBadge, string> = {
  แนะนำ: 'bg-ink text-white',
  สินค้าขายดี: 'bg-brand text-white',
  ใหม่: 'bg-amber-400 text-ink',
};

export function CategoryProductCard({ product }: { product: CpuProduct }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.id,
        price: product.price,
        category: 'cpu',
      }),
    );
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card">
      <div className="relative flex aspect-square items-center justify-center bg-slate-50 p-3">
        <FavoriteButton label={`เพิ่ม ${product.name} ในรายการโปรด`} />
        {product.badge && (
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[11px] font-semibold leading-none shadow-sm ${badgeStyle[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <BsCpu size={56} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">{product.name}</h3>
        <p className="text-xs text-slate-400">
          {product.cores}C/{product.threads}T | {product.clock}
        </p>
        <p className="text-[11px] text-slate-400">
          {product.socket} · {product.brand}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
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
    </div>
  );
}
