import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  badge?: number;
  variant?: 'light' | 'dark';
}

/** Circular icon-only button with an accessible label and an optional count badge (e.g. cart items). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, badge, variant = 'light', className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        variant === 'light' ? 'text-ink hover:bg-slate-100' : 'text-white hover:bg-white/10',
        className,
      )}
      {...props}
    >
      {icon}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
