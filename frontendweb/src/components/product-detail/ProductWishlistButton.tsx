import { FiHeart } from 'react-icons/fi';
import type { ProductCategorySlug } from '../../data/catalog';
import { useWishlistToggle } from '../../hooks/useWishlist';
import { cn } from '../../lib/cn';

/** "เพิ่มในรายการโปรด" text button under the product title, backed by the wishlist slice. */
export function ProductWishlistButton({ category, productId }: { category: ProductCategorySlug; productId: string }) {
  const { isWishlisted, toggle } = useWishlistToggle(category, productId);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isWishlisted}
      className={cn('flex items-center gap-1.5 transition-colors hover:text-brand', isWishlisted && 'text-brand')}
    >
      <FiHeart size={15} className={isWishlisted ? 'fill-current' : ''} aria-hidden="true" />
      {isWishlisted ? 'อยู่ในรายการโปรดแล้ว' : 'เพิ่มในรายการโปรด'}
    </button>
  );
}
