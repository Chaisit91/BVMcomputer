import { BsHeartFill } from 'react-icons/bs';
import { FiHeart } from 'react-icons/fi';
import type { ProductCategorySlug } from '../../data/catalog';
import { useWishlistToggle } from '../../hooks/useWishlist';

interface FavoriteButtonProps {
  category: ProductCategorySlug;
  productId: string;
  productName: string;
}

/** Wishlist toggle overlaid on a product card's image, backed by the wishlist slice. */
export function FavoriteButton({ category, productId, productName }: FavoriteButtonProps) {
  const { isWishlisted, toggle } = useWishlistToggle(category, productId);

  return (
    <button
      type="button"
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? `นำ ${productName} ออกจากรายการโปรด` : `เพิ่ม ${productName} ในรายการโปรด`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className="absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-200 hover:bg-slate-50"
    >
      {isWishlisted ? (
        <BsHeartFill size={19} className="text-brand" aria-hidden="true" />
      ) : (
        <FiHeart size={20} strokeWidth={1.6} className="text-[#172033]" aria-hidden="true" />
      )}
    </button>
  );
}
