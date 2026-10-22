import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { toCartCategoryKey } from '../../data/productLookup';
import { productCategoryIcons } from '../shared/productCategoryIcons';
import { formatTHB } from '../../lib/format';
import type { ProductSummary } from '../../api/productApi';

/** Category-agnostic product card — used for search results, where items from any category are mixed. */
export function SearchResultCard({ product }: { product: ProductSummary }) {
  const dispatch = useAppDispatch();
  const Icon = productCategoryIcons[product.categorySlug];

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.id,
        price: product.price,
        category: toCartCategoryKey(product.categorySlug),
        brand: product.brand,
        imageUrl: product.imageUrl,
      }),
    );
  };

  return (
    <Link
      to={`/product/${product.categorySlug}/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card"
    >
      <div className="relative flex aspect-square items-center justify-center bg-slate-50 p-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <Icon size={44} className="text-slate-300" aria-hidden="true" />
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-medium uppercase text-slate-400">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink group-hover:text-brand">{product.name}</h3>
        <p className={product.inStock ? 'text-xs text-emerald-600' : 'text-xs text-slate-400'}>
          {product.inStock ? 'มีสินค้า' : 'สั่งจอง'}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-bold text-brand">{formatTHB(product.price)}</span>
          <button
            type="button"
            aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
            onClick={handleAddToCart}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
          >
            <FiShoppingCart size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </Link>
  );
}
