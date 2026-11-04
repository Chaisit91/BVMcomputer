import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { TaxAddress } from '../../types/api';
import { formatAddress } from './formatAddress';

interface TaxAddressCardProps {
  address: TaxAddress;
  /** While any change is being saved — radio and buttons lock so requests can't overlap. */
  busy: boolean;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** One saved tax-invoice address: default radio + badge, name and taxpayer ID, the address, edit and delete. */
export function TaxAddressCard({ address, busy, onSetDefault, onEdit, onDelete }: TaxAddressCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-card transition-colors sm:p-5 md:flex-row md:items-center md:gap-5',
        address.isDefault ? 'border-brand/30' : 'border-slate-100',
      )}
    >
      <div className="flex items-center gap-3 md:gap-5">
        <input
          type="radio"
          name="default-tax-address"
          checked={address.isDefault}
          disabled={busy}
          onChange={onSetDefault}
          aria-label={`ใช้ที่อยู่ของ ${address.name} เป็นที่อยู่หลักสำหรับออกใบกำกับภาษี`}
          className="h-5 w-5 shrink-0 cursor-pointer accent-brand disabled:cursor-not-allowed"
        />
        <span className="hidden h-12 w-px bg-slate-100 md:block" aria-hidden="true" />
        {/* Fixed width on desktop so the name column lines up across cards, badge or not. */}
        <span className="md:w-[88px]">
          {address.isDefault && (
            <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand">ที่อยู่หลัก</span>
          )}
        </span>
        <span className="hidden h-12 w-px bg-slate-100 md:block" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold text-ink">{address.name}</p>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#7D879C]">
            {address.payerType === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#2B3445]">เลขประจำตัวผู้เสียภาษี: {address.taxId}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{formatAddress(address)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          aria-label={`แก้ไขที่อยู่ของ ${address.name}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-medium text-[#2B3445] transition-colors hover:bg-slate-100 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 md:w-11 md:flex-none"
        >
          <FiEdit2 size={17} aria-hidden="true" />
          <span className="md:hidden">แก้ไข</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`ลบที่อยู่ของ ${address.name}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-medium text-[#2B3445] transition-colors hover:bg-red-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 md:w-11 md:flex-none"
        >
          <FiTrash2 size={17} aria-hidden="true" />
          <span className="md:hidden">ลบ</span>
        </button>
      </div>
    </article>
  );
}
