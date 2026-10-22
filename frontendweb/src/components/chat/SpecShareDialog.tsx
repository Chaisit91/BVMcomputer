import { useState } from 'react';
import { FiShield, FiX } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { SpecShareOption } from '../../data/chatSpecShare';
import type { SharedSpecItem } from '../../types/chat';
import type { UpgradeSpecFieldId } from '../../data/upgradeSpecFields';

interface SpecShareDialogProps {
  options: SpecShareOption[];
  isDemo: boolean;
  onCancel: () => void;
  onConfirm: (items: SharedSpecItem[]) => void;
}

/**
 * Consent step before any spec leaves the browser: lists exactly what will be sent, lets the
 * customer untick items, and shows unfilled fields as "not specified" (they're never sent or guessed).
 */
export function SpecShareDialog({ options, isDemo, onCancel, onConfirm }: SpecShareDialogProps) {
  const filled = options.filter((option) => option.item !== null);
  const [checked, setChecked] = useState<Set<UpgradeSpecFieldId>>(() => new Set(filled.map((o) => o.field)));

  const toggle = (field: UpgradeSpecFieldId) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });

  const selectedItems = filled.filter((o) => checked.has(o.field)).map((o) => o.item!);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-share-title"
      className="absolute inset-0 z-10 flex flex-col bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h3 id="spec-share-title" className="text-sm font-bold text-ink">
          ยืนยันการส่งข้อมูลสเปคให้แอดมิน
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="ยกเลิก"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink"
        >
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {filled.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            ยังไม่มีข้อมูลสเปคที่กรอกไว้ — กรอกข้อมูลในฟอร์มอัปเกรดก่อน หรือพิมพ์สอบถามแอดมินได้เลย
          </p>
        ) : (
          <p className="mb-2 text-xs text-slate-500">เลือกข้อมูลที่ต้องการส่ง (ข้อมูลที่ไม่ได้เลือกจะไม่ถูกส่ง)</p>
        )}

        <ul className="flex flex-col gap-1.5">
          {options.map((option) =>
            option.item ? (
              <li key={option.field}>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={checked.has(option.field)}
                    onChange={() => toggle(option.field)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block text-xs text-slate-500">{option.label}</span>
                    <span className="block break-words font-medium text-ink">{option.item.value}</span>
                  </span>
                </label>
              </li>
            ) : (
              <li key={option.field} className="flex items-start gap-2.5 px-2 py-1.5 opacity-60">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-dashed border-slate-300" aria-hidden="true" />
                <span className="text-sm">
                  <span className="block text-xs text-slate-500">{option.label}</span>
                  <span className="block text-slate-400">ไม่ได้ระบุ — จะไม่ถูกส่ง</span>
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <p className="mb-3 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
          <FiShield size={12} className="mt-px shrink-0" aria-hidden="true" />
          {isDemo
            ? 'โหมดทดสอบ: ข้อมูลจะแสดงในแชทนี้เท่านั้น ยังไม่ถูกส่งถึงแอดมิน'
            : 'ข้อมูลจะถูกส่งให้แอดมินเพื่อใช้ให้คำปรึกษาเรื่องการอัปเกรดเท่านั้น'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-full border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={() => onConfirm(selectedItems)}
            className={cn(
              'h-11 flex-1 rounded-full text-sm font-semibold text-white transition-colors',
              selectedItems.length === 0 ? 'cursor-not-allowed bg-slate-200 text-slate-400' : 'bg-brand hover:bg-brand-dark',
            )}
          >
            ยืนยันส่งข้อมูล ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
