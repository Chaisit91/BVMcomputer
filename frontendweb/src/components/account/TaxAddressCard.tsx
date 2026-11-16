import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { TaxAddress } from '../../types/api';
import { formatAddress } from './formatAddress';
import { DefaultBadge, ListItemAction } from './ListItemParts';
import { listItemBorderClass, listItemBoxClass, listItemRadioClass } from './listItemStyles';

interface TaxAddressCardProps {
  address: TaxAddress;
  /** While any change is being saved — radio and buttons lock so requests can't overlap. */
  busy: boolean;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * One saved tax-invoice address, laid out like the shipping-address row (same box, badge and buttons):
 * radio + badge | name and payer type, the address below | edit and delete.
 */
export function TaxAddressCard({ address, busy, onSetDefault, onEdit, onDelete }: TaxAddressCardProps) {
  const radioId = `tax-address-default-${address.id}`;

  return (
    <article
      className={cn(listItemBoxClass, listItemBorderClass(address.isDefault), 'flex flex-col gap-4 md:flex-row md:items-center md:gap-6')}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <input
          id={radioId}
          type="radio"
          name="default-tax-address"
          checked={address.isDefault}
          disabled={busy}
          onChange={onSetDefault}
          aria-label={`ใช้ที่อยู่ของ ${address.name} เป็นที่อยู่หลักสำหรับออกใบกำกับภาษี`}
          className={listItemRadioClass}
        />
        {/* Fixed width on desktop so the name column lines up across cards. */}
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
        {/* The taxpayer ID isn't shown in the list — it's still saved and appears when editing. */}
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-ink">{address.name}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#7D879C]">
            {address.payerType === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
          </span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 md:mt-1 md:leading-normal">{formatAddress(address)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
        <ListItemAction icon={FiEdit2} label="แก้ไข" ariaLabel={`แก้ไขที่อยู่ของ ${address.name}`} tone="edit" disabled={busy} onClick={onEdit} />
        <ListItemAction icon={FiTrash2} label="ลบ" ariaLabel={`ลบที่อยู่ของ ${address.name}`} tone="delete" disabled={busy} onClick={onDelete} />
      </div>
    </article>
  );
}
