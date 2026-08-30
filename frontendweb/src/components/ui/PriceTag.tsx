import { formatTHB } from '../../lib/format';

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'lg';
}

export function PriceTag({ price, originalPrice, size = 'sm' }: PriceTagProps) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={size === 'lg' ? 'text-xl font-bold text-brand' : 'text-base font-bold text-brand'}>
        {formatTHB(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-xs text-slate-400 line-through">{formatTHB(originalPrice)}</span>
      )}
    </div>
  );
}
