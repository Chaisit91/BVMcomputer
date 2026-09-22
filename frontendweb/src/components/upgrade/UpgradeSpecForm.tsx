import { FiCpu } from 'react-icons/fi';
import { PiSparkleFill } from 'react-icons/pi';
import { categoryIcons } from '../home/categoryIcons';
import { SpecSearchField } from './SpecSearchField';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

interface SpecFieldMeta {
  key: UpgradeComponentKey;
  label: string;
  placeholder: string;
}

const specFields: SpecFieldMeta[] = [
  { key: 'cpu', label: 'CPU (ซีพียู)', placeholder: 'ค้นหา CPU เช่น Intel, Ryzen 5 5600' },
  { key: 'gpu', label: 'การ์ดจอ (GPU)', placeholder: 'ค้นหา GPU เช่น RTX 3060, RX 6600' },
  { key: 'motherboard', label: 'Mainboard (เมนบอร์ด)', placeholder: 'ค้นหาเมนบอร์ด เช่น B460, B550, Z790' },
  { key: 'ram', label: 'RAM (หน่วยความจำ)', placeholder: 'ค้นหา RAM เช่น 16GB DDR4 3200' },
  { key: 'storage', label: 'Storage (ที่เก็บข้อมูล)', placeholder: 'ค้นหา SSD/HDD เช่น Samsung 970 EVO' },
  { key: 'psu', label: 'PSU (พาวเวอร์ซัพพลาย)', placeholder: 'ค้นหา PSU เช่น 550W, 750W, Corsair' },
  { key: 'case', label: 'Case (เคส)', placeholder: 'ค้นหาเคส เช่น ATX, NZXT, Cooler Master' },
  { key: 'cooling', label: 'CPU Cooler (ชุดระบายความร้อน)', placeholder: 'ค้นหาชุดระบายความร้อน เช่น Air Cooler, 240mm' },
];

const budgetOptions = [
  'ไม่เกิน 5,000 บาท',
  '5,000 - 10,000 บาท',
  '10,000 - 20,000 บาท',
  '20,000 - 40,000 บาท',
  '40,000 บาทขึ้นไป',
];

const usageOptions = ['เล่นเกม (Gaming)', 'ทำงาน (Work)', 'สตรีมมิ่ง (Streaming)', 'ตัดต่อ/กราฟิก (Creator)', 'ใช้งานทั่วไป (General)'];

const inputClass = 'h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-ink outline-none focus:border-brand';

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
  /** Continues to step 2 (choosing the replacement parts). */
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
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
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
            component={field.key}
            label={field.label}
            placeholder={field.placeholder}
            icon={categoryIcons[field.key]}
            value={selection[field.key] ?? null}
            onSelect={(product) => onSelectComponent(field.key, product)}
            onClear={() => onClearComponent(field.key)}
          />
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-ink">ข้อมูลเพิ่มเติม (ไม่บังคับ)</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">งบประมาณที่ต้องการอัปเกรด</span>
            <select value={budget} onChange={(e) => onBudgetChange(e.target.value)} className={inputClass}>
              <option value="">ไม่ระบุ</option>
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">จุดประสงค์การใช้งาน</span>
            <select value={usage} onChange={(e) => onUsageChange(e.target.value)} className={inputClass}>
              <option value="">ไม่ระบุ</option>
              {usageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">เกมหรือโปรแกรมที่ใช้งานเป็นหลัก</span>
            <input
              type="text"
              value={games}
              onChange={(e) => onGamesChange(e.target.value)}
              placeholder="เช่น FiveM, Valorant, PUBG"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onSelectParts}
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
    </div>
  );
}
