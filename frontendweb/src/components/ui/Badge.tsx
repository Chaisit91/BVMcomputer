import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { ProductBadge } from '../../types';

const badgeStyles: Record<ProductBadge, string> = {
  sale: 'bg-brand text-white',
  new: 'bg-amber-400 text-ink',
  bestseller: 'bg-ink text-white',
  hot: 'bg-orange-500 text-white',
};

const badgeLabels: Record<ProductBadge, string> = {
  sale: 'ลดราคา',
  new: 'ใหม่',
  bestseller: 'ขายดี',
  hot: 'มาแรง',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: ProductBadge;
}

export function Badge({ tone, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold leading-none shadow-sm',
        badgeStyles[tone],
        className,
      )}
      {...props}
    >
      {badgeLabels[tone]}
    </span>
  );
}
