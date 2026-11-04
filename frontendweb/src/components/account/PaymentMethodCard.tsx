import { FiTrash2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { PaymentMethod } from '../../types/api';
import { CardBrandLogo } from './CardBrandLogo';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  /** While any change is being saved — radio and buttons lock so requests can't overlap. */
  busy: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}

/** Expired once the last day of its expiry month has passed. */
function isExpired(method: PaymentMethod): boolean {
  const now = new Date();
  return method.expYear < now.getFullYear() || (method.expYear === now.getFullYear() && method.expMonth < now.getMonth() + 1);
}

/** One saved card: default radio, network logo, holder, masked number, issuing bank, default badge, delete. */
export function PaymentMethodCard({ method, busy, onSetDefault, onDelete }: PaymentMethodCardProps) {
  const expired = isExpired(method);
  const expiry = `${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`;

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-card transition-colors sm:p-5 lg:flex-row lg:items-center lg:gap-5',
        method.isDefault ? 'border-brand/30' : 'border-slate-100',
      )}
    >
      <div className="flex items-center gap-4 lg:gap-5">
        <input
          type="radio"
          name="default-payment-method"
          checked={method.isDefault}
          disabled={busy}
          onChange={onSetDefault}
          aria-label={`ใช้บัตรที่ลงท้ายด้วย ${method.last4} เป็นค่าเริ่มต้น`}
          className="h-5 w-5 shrink-0 cursor-pointer accent-brand disabled:cursor-not-allowed"
        />
        <span className="hidden h-12 w-px bg-slate-100 lg:block" aria-hidden="true" />
        <CardBrandLogo brand={method.brand} />
        {/* Mobile: the badge sits next to the logo; on desktop it has its own column. */}
        {method.isDefault && (
          <span className="ml-auto rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand lg:hidden">ค่าเริ่มต้น</span>
        )}
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs text-[#7D879C]">ชื่อเจ้าของบัตร</p>
          <p className="truncate text-base font-bold text-ink" title={method.holderName}>
            {method.holderName}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#7D879C]">หมายเลขบัตร</p>
          <p className="whitespace-nowrap font-medium tracking-wide text-[#2B3445]">XXXX-XXXX-XXXX-{method.last4}</p>
          <p className={cn('text-xs', expired ? 'font-semibold text-brand' : 'text-[#7D879C]')}>
            {expired ? `บัตรหมดอายุแล้ว (${expiry})` : `หมดอายุ ${expiry}`}
          </p>
        </div>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-[#7D879C]">ธนาคารผู้ออกบัตร</p>
          <p className="line-clamp-2 text-sm text-[#2B3445]" title={method.bankName}>
            {method.bankName}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
        <span className="hidden w-[84px] lg:block">
          {method.isDefault && <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand">ค่าเริ่มต้น</span>}
        </span>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`ลบบัตรที่ลงท้ายด้วย ${method.last4}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-medium text-[#2B3445] transition-colors hover:bg-red-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 lg:w-11 lg:flex-none"
        >
          <FiTrash2 size={17} aria-hidden="true" />
          <span className="lg:hidden">ลบบัตร</span>
        </button>
      </div>
    </article>
  );
}
