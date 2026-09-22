import { FiAlertTriangle, FiCheck, FiCheckCircle, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import { PiLightbulbFilamentFill } from 'react-icons/pi';
import { cn } from '../../lib/cn';
import {
  mockAiInsight,
  mockCompatibilityChecklist,
  mockCompatibilityScore,
  type CompatibilityCheckItem,
} from '../../data/upgradeAnalysisMock';

const checkStyles: Record<CompatibilityCheckItem['status'], { icon: typeof FiCheck; text: string; bg: string; ring: string }> = {
  compatible: { icon: FiCheck, text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  warning: { icon: FiAlertTriangle, text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
  incompatible: { icon: FiXCircle, text: 'text-brand', bg: 'bg-red-50', ring: 'ring-red-100' },
};

/**
 * Center column of step 3 — score ring, stat badges, the detailed checklist and an AI
 * insight card. Numbers here are illustrative mock data (see upgradeAnalysisMock.ts);
 * the real compatibility engine isn't built yet.
 */
export function CompatibilityScorePanel() {
  const { score, max, status, passed, totalChecks, warnings, errors, opportunities } = mockCompatibilityScore;
  const pct = score / max;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          <h2 className="text-base font-bold text-ink">ผลการตรวจสอบความเข้ากันได้</h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-ink">{score}</span>
              <span className="text-xs font-medium text-slate-400">จาก {max} คะแนน</span>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <FiCheckCircle size={16} aria-hidden="true" />
            {status}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-emerald-600">
              {passed}/{totalChecks}
            </p>
            <p className="text-[11px] font-medium text-emerald-700/80">ผ่านการตรวจสอบ</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-amber-600">{warnings}</p>
            <p className="text-[11px] font-medium text-amber-700/80">คำเตือน</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-slate-500">{errors}</p>
            <p className="text-[11px] font-medium text-slate-500">ข้อผิดพลาด</p>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-brand">{opportunities}</p>
            <p className="text-[11px] font-medium text-brand/80">โอกาสอัปเกรด</p>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          * แสดง {mockCompatibilityChecklist.length} จาก {totalChecks} จุดตรวจสอบความเข้ากันได้
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {mockCompatibilityChecklist.map((item) => {
            const style = checkStyles[item.status];
            const Icon = style.icon;
            return (
              <li
                key={item.id}
                className={cn('flex items-start gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5 ring-1 ring-inset', style.bg, style.ring)}
              >
                <Icon size={16} className={cn('mt-0.5 shrink-0', style.text)} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
          <PiLightbulbFilamentFill size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <FiTrendingUp size={14} className="text-brand" aria-hidden="true" />
            AI Insight
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{mockAiInsight}</p>
        </div>
      </div>
    </div>
  );
}
