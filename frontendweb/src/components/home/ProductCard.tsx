import { FiShoppingCart } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { PriceTag } from '../ui/PriceTag';
import { categoryIcons } from './categoryIcons';
import { cn } from '../../lib/cn';
import type { Product } from '../../types';

/** Product image placeholder — no real photography yet, so render a branded icon tile instead. */
function ProductThumb({ product }: { product: Product }) {
  const Icon = categoryIcons[product.category];
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-lg bg-white">
      <Icon size={36} className="text-slate-300" aria-hidden="true" />
      {product.badge && <Badge tone={product.badge} className="absolute left-1.5 top-1.5 px-1.5 py-0.5 text-[10px]" />}
    </div>
  );
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const dispatch = useAppDispatch();

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-card',
        className,
      )}
    >
      <ProductThumb product={product} />
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <h3 className="line-clamp-2 min-h-[2rem] text-xs font-medium text-ink">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-1">
          <PriceTag price={product.price} originalPrice={product.originalPrice} size="xs" />
          <IconButton
            icon={<FiShoppingCart size={14} />}
            label={`เพิ่ม ${product.name} ลงตะกร้า`}
            variant="light"
            className="h-7 w-7 shrink-0 bg-slate-100 hover:bg-brand hover:text-white"
            onClick={() => dispatch(addToCart(product))}
          />
        </div>
      </div>
    </div>
  );
}
