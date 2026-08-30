import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { PriceTag } from '../ui/PriceTag';
import { categoryIcons } from './categoryIcons';
import type { Product } from '../../types';

/** Product image placeholder — no real photography yet, so render a branded icon tile instead. */
function ProductThumb({ product }: { product: Product }) {
  const Icon = categoryIcons[product.category];
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200">
      <Icon size={56} className="text-slate-400" aria-hidden="true" />
      {product.badge && <Badge tone={product.badge} className="absolute left-2 top-2" />}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card">
      <ProductThumb product={product} />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <PriceTag price={product.price} originalPrice={product.originalPrice} />
          <IconButton
            icon={<FiShoppingCart size={16} />}
            label={`เพิ่ม ${product.name} ลงตะกร้า`}
            variant="light"
            className="h-9 w-9 shrink-0 bg-slate-100 hover:bg-brand hover:text-white"
            onClick={() => dispatch(addToCart(product))}
          />
        </div>
      </div>
    </div>
  );
}
