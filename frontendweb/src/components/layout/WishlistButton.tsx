import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { WISHLIST_PATH } from '../../hooks/useWishlist';
import { HeaderIconLabel } from './HeaderIconLabel';

export function WishlistButton() {
  return (
    <Link
      to={WISHLIST_PATH}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5F8] text-ink transition-colors hover:bg-slate-200"
    >
      <HeaderIconLabel icon={<FiHeart size={20} aria-hidden="true" />} label="รายการโปรด" />
    </Link>
  );
}
