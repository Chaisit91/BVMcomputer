import { FiTrash2 } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { PaymentMethod } from '../../types/api';
import { CardBrandLogo } from './CardBrandLogo';
import { DefaultBadge, ListItemAction } from './ListItemParts';
import { listItemBorderClass, listItemBoxClass, listItemRadioClass } from './listItemStyles';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  /** While any change is being saved — buttons lock so requests can't overlap. */
  busy: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}

/** Expired once the last day of its expiry month has passed. */
function isExpired(method: PaymentMethod): boolean {
  const now = new Date();
  return method.expYear < now.getFullYear() || (method.expYear === now.getFullYear() && method.expMonth < now.getMonth() + 1);
}

/** Thin vertical rule before a desktop column, matching the name | phone rule on the address rows. */
const columnRule = 'md:border-l md:border-slate-200 md:pl-5';

/**
 * One saved card as a single row: default radio | network logo | holder | masked number | issuing bank,
 * then the default badge and delete. Stacks into a compact block on small screens.
 */
export function PaymentMethodCard({ method, busy, onSetDefault, onDelete }: PaymentMethodCardProps) {
  const expired = isExpired(method);
  const expiry = `${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`;

  return (
    <article
      className={cn(
        listItemBoxClass,
        listItemBorderClass(method.isDefault),
        'grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3',
        // Fixed radio / logo / number / actions widths so the columns line up from one card to the next.
        'md:grid-cols-[20px_56px_minmax(0,1fr)_180px_minmax(0,1.6fr)_148px] md:gap-x-5',
      )}
    >
      <input
        type="radio"
        name="default-payment-method"
        checked={method.isDefault}
        disabled={busy}
        onChange={onSetDefault}
        aria-label={`ใช้บัตรที่ลงท้ายด้วย ${method.last4} เป็นค่าเริ่มต้น`}
        className={listItemRadioClass}
      />

      <CardBrandLogo brand={method.brand} className="h-10 w-14 border-slate-100 shadow-sm" />

      <p className="truncate text-base font-bold text-ink" title={method.holderName}>
        {method.holderName}
      </p>

      {/* Mobile: number and bank sit under the name, aligned with it. */}
      <div className={cn('col-start-3 md:col-start-auto', columnRule)}>
        <p className="whitespace-nowrap text-sm tracking-wide text-[#2B3445]">XXXX-XXXX-XXXX-{method.last4}</p>
        {expired && <p className="text-xs font-semibold text-brand">บัตรหมดอายุแล้ว ({expiry})</p>}
      </div>

      <div className={cn('col-start-3 min-w-0 md:col-start-auto', columnRule)}>
        {method.bankName ? (
          <p className="line-clamp-2 text-sm uppercase text-[#2B3445]" title={method.bankName}>
            {method.bankName}
          </p>
        ) : (
          // Never guessed — shown as unknown when the provider's BIN lookup didn't identify the issuer.
          <p className="text-sm text-slate-400">ไม่สามารถระบุธนาคารผู้ออกบัตรได้</p>
        )}
      </div>

      <div className={cn('col-span-3 flex items-center gap-2 border-t border-slate-100 pt-3 md:col-span-1 md:justify-end md:border-t-0 md:pt-0', columnRule)}>
        {method.isDefault && (
          <span className="mr-auto md:mr-0">
            <DefaultBadge label="ค่าเริ่มต้น" />
          </span>
        )}
        <ListItemAction
          icon={FiTrash2}
          label="ลบบัตร"
          ariaLabel={`ลบบัตรที่ลงท้ายด้วย ${method.last4}`}
          tone="delete"
          disabled={busy}
          onClick={onDelete}
        />
      </div>
    </article>
  );
}
