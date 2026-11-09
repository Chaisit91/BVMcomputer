import { FiEdit2, FiPhone, FiTrash2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { SavedAddress } from '../../types/api';
import { formatAddress, formatPhone } from './formatAddress';
import { DefaultBadge, ListItemAction } from './ListItemParts';
import { listItemBorderClass, listItemBoxClass, listItemRadioClass } from './listItemStyles';

interface AddressCardProps {
  address: SavedAddress;
  /** While any change is being saved — radio and buttons lock so requests can't overlap. */
  busy: boolean;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** One saved address: default radio + badge, recipient and phone, the address, edit and delete. */
export function AddressCard({ address, busy, onSetDefault, onEdit, onDelete }: AddressCardProps) {
  const radioId = `address-default-${address.id}`;

  return (
    <article
      className={cn(listItemBoxClass, listItemBorderClass(address.isDefault), 'flex flex-col gap-4 md:flex-row md:items-center md:gap-5')}
    >
      <div className="flex items-center gap-3 md:gap-5">
        <input
          id={radioId}
          type="radio"
          name="default-shipping-address"
          checked={address.isDefault}
          disabled={busy}
          onChange={onSetDefault}
          aria-label={`ใช้ที่อยู่ของ ${address.recipientName} เป็นที่อยู่หลัก`}
          className={listItemRadioClass}
        />
        <span className="hidden h-10 w-px bg-slate-100 md:block" aria-hidden="true" />
        {/* Fixed width on desktop so the recipient column lines up across cards. */}
        <span className="md:w-[88px]">
          {address.isDefault ? (
            <DefaultBadge label="ที่อยู่หลัก" />
          ) : (
            <label htmlFor={radioId} className="cursor-pointer text-xs font-medium text-slate-400 hover:text-brand">
              ตั้งเป็นที่อยู่หลัก
            </label>
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-base font-bold text-ink">{address.recipientName}</p>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <p className="flex items-center gap-1.5 text-sm text-[#2B3445]">
            <FiPhone size={14} className="text-[#7D879C]" aria-hidden="true" />
            {formatPhone(address.phone)}
          </p>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 md:mt-1 md:leading-normal">{formatAddress(address)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
        <ListItemAction
          icon={FiEdit2}
          label="แก้ไข"
          ariaLabel={`แก้ไขที่อยู่ของ ${address.recipientName}`}
          tone="edit"
          disabled={busy}
          onClick={onEdit}
        />
        <ListItemAction
          icon={FiTrash2}
          label="ลบ"
          ariaLabel={`ลบที่อยู่ของ ${address.recipientName}`}
          tone="delete"
          disabled={busy}
          onClick={onDelete}
        />
      </div>
    </article>
  );
}
