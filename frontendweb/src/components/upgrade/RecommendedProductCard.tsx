import type { MouseEvent } from 'react';
import type { IconType } from 'react-icons';
import { FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { formatTHB } from '../../lib/format';
import type { UpgradeProduct } from '../../types/upgrade';

/** A plain browse-and-buy card for step 3's "สินค้าที่แนะนำสำหรับคุณ" grid — no select/toggle state. */
export function RecommendedProductCard({ product, icon: Icon }: { product: UpgradeProduct; icon: IconType }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        id: product.productId,
        name: product.name,
        slug: product.productId,
        price: product.price,
        category: product.category,
        brand: product.brand,
        skuCode: product.sku,
        imageUrl: product.image,
      }),
    );
  };

  return (
    <Link
      to={`/product/${product.category}/${product.productId}`}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card"
    >
      <div className="flex aspect-square items-center justify-center bg-slate-50 p-3">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <Icon size={48} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">{product.name}</h3>
        <p className="truncate text-xs text-slate-400">{product.specifications.slice(0, 2).join(' · ')}</p>

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
    </Link>
  );
}
