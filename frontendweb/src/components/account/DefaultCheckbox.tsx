import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../lib/cn';

interface DefaultCheckboxProps {
  /**
   * Shown ticked, grey and unclickable — the first item ever added (nothing else could be the default),
   * or editing the item that already is the default.
   */
  locked: boolean;
  label: string;
  /** Short reason shown next to the label while locked, e.g. "(ที่อยู่แรกจะเป็นที่อยู่หลัก)". */
  lockedHint: string;
  /** react-hook-form registration for the free (unlocked) checkbox. */
  registration: UseFormRegisterReturn;
  className?: string;
}

/** "ตั้งเป็น…ค่าเริ่มต้น" checkbox shared by the shipping-address, tax-address and add-card forms. */
export function DefaultCheckbox({ locked, label, lockedHint, registration, className }: DefaultCheckboxProps) {
  return (
    <label
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm',
        locked ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer text-[#2B3445]',
        className,
      )}
    >
      {locked ? (
        // Separate element from the registered one, so React never switches an input between modes.
        <input key="locked" type="checkbox" checked readOnly disabled className="h-4 w-4 accent-slate-400" />
      ) : (
        <input key="free" type="checkbox" className="h-4 w-4 accent-brand" {...registration} />
      )}
      {label}
      {locked && <span className="text-xs text-slate-400">{lockedHint}</span>}
    </label>
  );
}
