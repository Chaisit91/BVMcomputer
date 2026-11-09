import type { IconType } from 'react-icons';
import { cn } from '../../lib/cn';

/** "ที่อยู่หลัก" / "ค่าเริ่มต้น" — one badge style for both lists. */
export function DefaultBadge({ label }: { label: string }) {
  return <span className="inline-block whitespace-nowrap rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand">{label}</span>;
}

interface ListItemActionProps {
  icon: IconType;
  /** Visible on mobile (full-width buttons); icon-only 40×40 from md up. */
  label: string;
  ariaLabel: string;
  /** Delete turns red on hover; edit only tints the icon. */
  tone: 'edit' | 'delete';
  disabled: boolean;
  onClick: () => void;
}

/** Edit / delete button shared by the address and payment rows — same hit area and icon size. */
export function ListItemAction({ icon: Icon, label, ariaLabel, tone, disabled, onClick }: ListItemActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-medium text-[#2B3445] transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:w-10 md:flex-none',
        tone === 'delete' ? 'hover:bg-red-50 hover:text-brand' : 'hover:bg-slate-100 hover:text-brand',
      )}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="md:hidden">{label}</span>
    </button>
  );
}
