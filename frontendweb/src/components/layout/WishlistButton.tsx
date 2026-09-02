import { FiHeart } from 'react-icons/fi';
import { HeaderIconLabel } from './HeaderIconLabel';

export function WishlistButton() {
  return (
    <a
      href="#wishlist"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5F8] text-ink transition-colors hover:bg-slate-200"
    >
      <HeaderIconLabel icon={<FiHeart size={20} aria-hidden="true" />} label="รายการโปรด" />
    </a>
  );
}
