import { useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiPlus } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { CheckoutDialog } from './CheckoutDialog';

export interface PickerOption {
  id: string;
  lines: ReactNode[];
  isDefault: boolean;
}

interface SavedAddressPickerProps {
  icon: IconType;
  title: string;
  description: string;
  options: PickerOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Goes to the account page to add another one (same flow as the empty state). */
  onAddNew: () => void;
  addNewLabel: string;
  onClose: () => void;
}

/**
 * Choose which saved account address this order uses. Only changes the choice for this order —
 * the account's default address is never touched. Mount it only while open, so the pending
 * choice starts from the current selection each time.
 */
export function SavedAddressPicker({
  icon,
  title,
  description,
  options,
  selectedId,
  onSelect,
  onAddNew,
  addNewLabel,
  onClose,
}: SavedAddressPickerProps) {
  const [pendingId, setPendingId] = useState(selectedId ?? options[0]?.id ?? null);

  return (
    <CheckoutDialog
      open
      onClose={onClose}
      icon={icon}
      title={title}
      description={description}
      submitLabel="ใช้ที่อยู่นี้"
      onSubmit={(e) => {
        e.preventDefault();
        if (pendingId) onSelect(pendingId);
      }}
    >
      <div role="radiogroup" aria-label={title} className="flex flex-col gap-3 sm:col-span-2">
        {options.map((option) => {
          const checked = option.id === pendingId;
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                checked ? 'border-brand bg-red-50' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <input
                type="radio"
                name="saved-address"
                checked={checked}
                onChange={() => setPendingId(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="flex min-w-0 flex-col gap-1 text-sm text-[#2B3445]">
                {option.lines.map((line, index) => (
                  <span key={index}>{line}</span>
                ))}
                {option.isDefault && (
                  <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">ที่อยู่หลัก</span>
                )}
              </span>
            </label>
          );
        })}

        <button
          type="button"
          onClick={onAddNew}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-brand/60 text-sm font-semibold text-brand transition-colors hover:bg-red-50"
        >
          <FiPlus size={18} aria-hidden="true" />
          {addNewLabel}
        </button>
      </div>
    </CheckoutDialog>
  );
}
