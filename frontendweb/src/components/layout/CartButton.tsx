import { FiShoppingCart } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { selectCartCount } from '../../features/cart/cartSelectors';
import { HeaderIconLabel } from './HeaderIconLabel';

export function CartButton() {
  const count = useAppSelector(selectCartCount);

  return (
    <button
      type="button"
      aria-label={`ตะกร้าสินค้า ${count} ชิ้น`}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5F8] text-ink transition-colors hover:bg-slate-200"
    >
      <HeaderIconLabel icon={<FiShoppingCart size={20} aria-hidden="true" />} label="ตะกร้าสินค้า" badge={count} />
    </button>
  );
}
