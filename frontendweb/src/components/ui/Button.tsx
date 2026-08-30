import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'border border-white/40 text-white hover:bg-white/10',
  ghost: 'text-ink hover:bg-slate-100',
  dark: 'bg-ink text-white hover:bg-ink-light',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

/** Reusable action button — pass `variant`/`size` to restyle instead of duplicating markup. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
