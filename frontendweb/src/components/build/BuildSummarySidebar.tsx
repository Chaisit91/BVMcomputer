import type { IconType } from 'react-icons';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';

export interface BuildSummaryRow {
  id: string;
  label: string;
  icon: IconType;
  required: boolean;
  selectedName: string | null;
  price: number;
}

interface BuildSummarySidebarProps {
  rows: BuildSummaryRow[];
  totalPrice: number;
  canCheckout: boolean;
  onEditStep: (stepId: string) => void;
  onAddAllToCart: () => void;
}

export function BuildSummarySidebar({ rows, totalPrice, canCheckout, onEditStep, onAddAllToCart }: BuildSummarySidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-80">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-ink">สรุปสเปคของคุณ</h2>

        <div className="mt-3 flex flex-col divide-y divide-slate-100">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onEditStep(row.id)}
              className="flex items-center gap-3 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  row.selectedName ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-400',
                )}
              >
                <row.icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">
                  {row.label}
                  {!row.required && ' (ไม่บังคับ)'}
                </p>
                <p className={cn('truncate text-sm font-medium', row.selectedName ? 'text-ink' : 'text-slate-400')}>
                  {row.selectedName ?? 'ยังไม่ได้เลือก'}
                </p>
              </div>
              {row.selectedName && (
                <span className="shrink-0 text-sm font-semibold text-brand">{formatTHB(row.price)}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-ink">ราคารวม</span>
          <span className="text-xl font-bold text-brand">{formatTHB(totalPrice)}</span>
        </div>

        <button
          type="button"
          onClick={onAddAllToCart}
          disabled={!canCheckout}
          className="mt-3 flex w-full items-center justify-center rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          เพิ่มทั้งชุดลงตะกร้า
        </button>
        {!canCheckout && (
          <p className="mt-2 text-center text-[11px] text-slate-400">เลือกชิ้นส่วนที่จำเป็นให้ครบก่อนนะครับ</p>
        )}
      </div>
    </aside>
  );
}
