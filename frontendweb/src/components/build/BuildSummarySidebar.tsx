import type { IconType } from 'react-icons';
import { HiWrenchScrewdriver } from 'react-icons/hi2';
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
  hasSelection: boolean;
  onEditStep: (stepId: string) => void;
  onAddAllToCart: () => void;
  onReset: () => void;
}

export function BuildSummarySidebar({
  rows,
  totalPrice,
  hasSelection,
  onEditStep,
  onAddAllToCart,
  onReset,
}: BuildSummarySidebarProps) {
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
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-lg',
                  row.selectedName ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-400',
                )}
              >
                <row.icon size={24} aria-hidden="true" />
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
          disabled={!hasSelection}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold leading-none text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <HiWrenchScrewdriver size={20} className="shrink-0" aria-hidden="true" />
          <span>สร้างชุดสเปคคอม</span>
        </button>
        {hasSelection && (
          <button
            type="button"
            onClick={onReset}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-[#808080] text-[15px] font-semibold leading-none text-white transition-colors hover:bg-[#6e6e6e]"
          >
            รีเซ็ต
          </button>
        )}
      </div>
    </aside>
  );
}
