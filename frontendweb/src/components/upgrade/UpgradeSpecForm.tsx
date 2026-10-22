import { useState, type FormEvent, type ReactNode } from 'react';
import { FiCpu } from 'react-icons/fi';
import { PiSparkleFill } from 'react-icons/pi';
import { categoryIcons } from '../home/categoryIcons';
import { SpecSearchField } from './SpecSearchField';
import { IncompleteSpecModal } from './IncompleteSpecModal';
import { cn } from '../../lib/cn';
import {
  specFieldDomId,
  specFieldOrder,
  specFields,
  validateUpgradeSpec,
  type UpgradeSpecFieldId,
} from '../../data/upgradeSpecFields';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

const budgetOptions = [
  'ไม่เกิน 5,000 บาท',
  '5,000 - 10,000 บาท',
  '10,000 - 20,000 บาท',
  '20,000 - 40,000 บาท',
  '40,000 บาทขึ้นไป',
];

const usageOptions = ['เล่นเกม (Gaming)', 'ทำงาน (Work)', 'สตรีมมิ่ง (Streaming)', 'ตัดต่อ/กราฟิก (Creator)', 'ใช้งานทั่วไป (General)'];

const inputClass = 'h-11 w-full rounded-lg border px-3.5 text-sm text-ink outline-none';

function controlClass(error?: string) {
  return cn(inputClass, error ? 'border-red-300 bg-red-50/40 focus:border-red-400' : 'border-slate-200 focus:border-brand');
}

interface UpgradeSpecFormProps {
  selection: UpgradeSelection;
  onSelectComponent: (key: UpgradeComponentKey, product: UpgradeProduct) => void;
  onClearComponent: (key: UpgradeComponentKey) => void;
  budget: string;
  onBudgetChange: (value: string) => void;
  usage: string;
  onUsageChange: (value: string) => void;
  games: string;
  onGamesChange: (value: string) => void;
  /** Continues to step 2 — only called once every required field is filled. */
  onSelectParts: () => void;
}

export function UpgradeSpecForm({
  selection,
  onSelectComponent,
  onClearComponent,
  budget,
  onBudgetChange,
  usage,
  onUsageChange,
  games,
  onGamesChange,
  onSelectParts,
}: UpgradeSpecFormProps) {
  // Errors only show after the first submit attempt, then update live as fields get filled.
  const [submitted, setSubmitted] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const errors = submitted ? validateUpgradeSpec({ selection, budget, usage, games }) : {};

  // Handles both the button click and pressing Enter inside a field. Re-validates on every attempt.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    const nextErrors = validateUpgradeSpec({ selection, budget, usage, games });
    if (specFieldOrder.some((id) => nextErrors[id])) {
      // Stay on this page: no navigation, no analysis, nothing cleared.
      setShowIncompleteModal(true);
      return;
    }
    onSelectParts();
  };

  // After the modal closes, bring the first field that still needs attention into view.
  const focusFirstInvalid = () => {
    const current = validateUpgradeSpec({ selection, budget, usage, games });
    const firstInvalid = specFieldOrder.find((id) => current[id]);
    if (!firstInvalid) return;
    const element = document.getElementById(specFieldDomId(firstInvalid));
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus({ preventScroll: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6"
    >
      <div className="mb-1 flex items-center gap-2.5">
        <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <h2 className="text-lg font-bold text-ink">กรอกสเปคคอมปัจจุบันของคุณ</h2>
      </div>
      <p className="mb-3.5 pl-[18px] text-sm text-slate-400">
        ระบุสเปคที่คุณใช้อยู่ตอนนี้ เพื่อให้ระบบสามารถวิเคราะห์และแนะนำการอัปเกรดที่เหมาะสม
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {specFields.map((field) => (
          <SpecSearchField
            key={field.key}
            inputId={specFieldDomId(field.key)}
            component={field.key}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.key]}
            icon={categoryIcons[field.key]}
            value={selection[field.key] ?? null}
            onSelect={(product) => onSelectComponent(field.key, product)}
            onClear={() => onClearComponent(field.key)}
          />
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-ink">ข้อมูลเพิ่มเติม</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ExtraField id="budget" label="งบประมาณที่ต้องการอัปเกรด" error={errors.budget}>
            <select
              id={specFieldDomId('budget')}
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
              aria-required="true"
              aria-invalid={errors.budget ? true : undefined}
              className={controlClass(errors.budget)}
            >
              <option value="">กรุณาเลือก</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ExtraField>
          <ExtraField id="usage" label="จุดประสงค์การใช้งาน" error={errors.usage}>
            <select
              id={specFieldDomId('usage')}
              value={usage}
              onChange={(e) => onUsageChange(e.target.value)}
              aria-required="true"
              aria-invalid={errors.usage ? true : undefined}
              className={controlClass(errors.usage)}
            >
              <option value="">กรุณาเลือก</option>
              {usageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ExtraField>
          <ExtraField id="games" label="เกมหรือโปรแกรมที่ใช้งานเป็นหลัก" error={errors.games}>
            <input
              id={specFieldDomId('games')}
              type="text"
              value={games}
              onChange={(e) => onGamesChange(e.target.value)}
              placeholder="เช่น FiveM, Valorant, PUBG"
              aria-required="true"
              aria-invalid={errors.games ? true : undefined}
              className={controlClass(errors.games)}
            />
          </ExtraField>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="submit"
          className="flex h-11 w-full max-w-[345px] items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <PiSparkleFill size={16} aria-hidden="true" />
          เลือกชิ้นส่วนอัปเกรด →
        </button>
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <FiCpu size={12} aria-hidden="true" />
          ข้อมูลของคุณจะถูกใช้เพื่อเลือกชิ้นส่วนที่เหมาะสมเท่านั้น ไม่มีการบันทึกหรือเปิดเผย
        </p>
      </div>

      <IncompleteSpecModal
        open={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        onClosed={focusFirstInvalid}
      />
    </form>
  );
}

function ExtraField({ id, label, error, children }: { id: UpgradeSpecFieldId; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={specFieldDomId(id)} className="text-xs font-medium text-slate-500">
        {label} <span className="text-brand">*</span>
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
