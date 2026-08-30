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
      className="flex flex-col items-center rounded-lg px-2.5 py-1.5 text-ink hover:bg-slate-100"
    >
      <HeaderIconLabel icon={<FiShoppingCart size={20} aria-hidden="true" />} label="ตะกร้าสินค้า" badge={count} />
    </button>
  );
}
