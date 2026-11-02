import { useEffect, useState } from 'react';
import { BsHeartFill } from 'react-icons/bs';
import { FiCheck, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';
import { productCategoryIcons } from '../shared/productCategoryIcons';
import type { Product } from '../../types';
import type { WishlistEntry } from '../../types/api';

/** A wishlist entry joined with its live catalog data (name, price, stock are never cached). */
export interface WishlistItemView {
  entry: WishlistEntry;
  name: string;
  specLine: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
  cartProduct: Product;
}

export function WishlistProductCard({ item }: { item: WishlistItemView }) {
  const dispatch = useAppDispatch();
  const [justAdded, setJustAdded] = useState(false);
  const { entry, name } = item;
  const href = `/product/${entry.category}/${entry.productId}`;
  const PlaceholderIcon = productCategoryIcons[entry.category];

  // "เพิ่มแล้ว" confirmation on the button, reverting after a moment.
  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = () => {
    dispatch(addToCart(item.cartProduct));
    setJustAdded(true);
  };

  const handleRemove = () => {
    void dispatch(removeFromWishlist(entry));
  };

  return (
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-card sm:p-4">
      <div className="relative">
        <Link to={href} className="flex aspect-[4/3] items-center justify-center rounded-xl bg-white p-2">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={name} className="h-full w-full object-contain" />
          ) : (
            <PlaceholderIcon size={56} className="text-slate-300" aria-hidden="true" />
          )}
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`นำ ${name} ออกจากรายการโปรด`}
          className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition-colors hover:bg-red-50"
        >
          <BsHeartFill size={17} className="text-brand" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        {/* Always two lines tall, so prices line up across cards whatever the name length. */}
        <Link to={href} className="line-clamp-2 min-h-[2lh] text-sm font-bold text-ink transition-colors hover:text-brand sm:text-[15px]">
          {name}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.specLine}</p>
        <p className="mt-2.5 text-lg font-bold text-brand sm:text-xl">{formatTHB(item.price)}</p>
        <p className={cn('mt-1.5 flex items-center gap-1.5 text-xs font-medium', item.inStock ? 'text-emerald-600' : 'text-slate-400')}>
          <span className={cn('h-2 w-2 rounded-full', item.inStock ? 'bg-emerald-500' : 'bg-slate-300')} aria-hidden="true" />
          {item.inStock ? 'มีสินค้า' : 'สินค้าหมด'}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!item.inStock}
            aria-label={`เพิ่ม ${name} ลงตะกร้า`}
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand text-sm font-semibold text-brand transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            {justAdded ? <FiCheck size={16} aria-hidden="true" /> : <FiShoppingCart size={16} aria-hidden="true" />}
            <span className="hidden truncate min-[400px]:inline">{justAdded ? 'เพิ่มแล้ว' : 'เพิ่มลงตะกร้า'}</span>
          </button>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`ลบ ${name} ออกจากรายการโปรด`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors hover:bg-red-50 hover:text-brand"
          >
            <FiTrash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
