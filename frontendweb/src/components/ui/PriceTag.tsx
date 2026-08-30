import { formatTHB } from '../../lib/format';

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'xs' | 'sm' | 'lg';
}

const priceSizes: Record<NonNullable<PriceTagProps['size']>, string> = {
  xs: 'text-sm font-bold text-brand',
  sm: 'text-base font-bold text-brand',
  lg: 'text-xl font-bold text-brand',
};

export function PriceTag({ price, originalPrice, size = 'sm' }: PriceTagProps) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={priceSizes[size]}>{formatTHB(price)}</span>
      {originalPrice && originalPrice > price && (
        <span className="text-[10px] text-slate-400 line-through">{formatTHB(originalPrice)}</span>
      )}
    </div>
  );
}
