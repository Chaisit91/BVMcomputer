import type { ReactNode } from 'react';

interface HeaderIconLabelProps {
  icon: ReactNode;
  label: string;
  badge?: number;
}

/** Icon-over-label content shared by the account, wishlist, and cart header buttons. */
export function HeaderIconLabel({ icon, label, badge }: HeaderIconLabelProps) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="relative">
        {icon}
        {typeof badge === 'number' && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className="hidden text-[11px] font-medium text-ink sm:block">{label}</span>
    </span>
  );
}
