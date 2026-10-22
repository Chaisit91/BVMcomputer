import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: ReactNode;
  /** Optional call to action, e.g. a link back to shopping or a retry button. */
  action?: ReactNode;
  className?: string;
  /** Recolor the icon badge, e.g. green for a success screen. */
  iconClassName?: string;
}

/** Dashed placeholder card for "nothing here" states — empty cart, no results, not found. */
export function EmptyState({ icon: Icon, title, description, action, className, iconClassName }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn('flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300', iconClassName)}
        >
          <Icon size={28} aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
