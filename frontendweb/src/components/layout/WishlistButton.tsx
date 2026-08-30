import { FiHeart } from 'react-icons/fi';
import { HeaderIconLabel } from './HeaderIconLabel';

export function WishlistButton() {
  return (
    <a
      href="#wishlist"
      className="flex flex-col items-center rounded-lg px-2.5 py-1.5 text-ink hover:bg-slate-100"
    >
      <HeaderIconLabel icon={<FiHeart size={20} aria-hidden="true" />} label="รายการโปรด" />
    </a>
  );
}
