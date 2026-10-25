import type { ReactNode } from 'react';
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiClock, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import { PiLightbulbFilamentFill } from 'react-icons/pi';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/cn';
import type { RequestStatus } from '../../types/api';
import type { CompatibilityStatus, UpgradeAnalysisResult } from '../../types/upgrade';

const checkStyles: Record<CompatibilityStatus, { icon: typeof FiCheck; text: string; bg: string; ring: string }> = {
  compatible: { icon: FiCheck, text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  warning: { icon: FiAlertTriangle, text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
  incompatible: { icon: FiXCircle, text: 'text-brand', bg: 'bg-red-50', ring: 'ring-red-100' },
};

const RING_RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface CompatibilityScorePanelProps {
  status: RequestStatus;
  error: string | null;
  result: UpgradeAnalysisResult | null;
  /** The result belongs to an earlier build — must not be shown as a confirmation. */
  stale: boolean;
  onRetry: () => void;
}

function ScoreRing({ value, max, color, children }: { value: number; max: number; color: string; children: ReactNode }) {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - value / max)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">{children}</div>
    </div>
  );
}

/**
 * Center column of step 3 — score ring, stat badges, checklist and insight, all taken from the
 * latest analysis result. While the build has changed since that result, it shows a "pending"
 * state instead of the old (no longer valid) verdict.
 */
export function CompatibilityScorePanel({ status, error, result, stale, onRetry }: CompatibilityScorePanelProps) {
  const isLoading = status === 'loading' || (status === 'idle' && !result);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center py-10 text-center">
          <ScoreRing value={0} max={100} color="#e2001a">
            <Spinner size={28} className="text-brand" />
          </ScoreRing>
          <p className="mt-3 text-sm font-semibold text-ink">กำลังวิเคราะห์ความเข้ากันได้...</p>
          <p className="mt-1 text-xs text-slate-400">ตรวจสอบชิ้นส่วนทั้งหมดในชุดอัปเกรดล่าสุด</p>
        </div>
      );
    }

    if (status === 'failed') {
      return <ErrorState title="วิเคราะห์ไม่สำเร็จ" message={error} onRetry={onRetry} className="border-0 py-10" />;
    }

    if (!result) return null;

    if (stale) {
      return (
        <div className="flex flex-col items-center py-6 text-center">
          <ScoreRing value={0} max={100} color="#cbd5e1">
            <FiClock size={30} className="text-slate-400" aria-hidden="true" />
          </ScoreRing>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-amber-600">
            <FiAlertTriangle size={16} aria-hidden="true" />
            รอตรวจสอบความเข้ากันได้
          </p>
          <p className="mt-3 max-w-xs rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700">
            มีการเปลี่ยนสินค้าหลังการวิเคราะห์ครั้งล่าสุด ผลเดิมจึงไม่ใช่ผลยืนยันของชุดสินค้านี้ — กด “วิเคราะห์ใหม่” เพื่อตรวจสอบอีกครั้ง
          </p>
        </div>
      );
    }

    const passed = result.checks.filter((c) => c.status === 'compatible').length;
    const warnings = result.checks.filter((c) => c.status === 'warning').length;
    const problems = result.checks.filter((c) => c.status === 'incompatible').length;
    const opportunities = result.recommendations.filter((r) => r.tier !== 'skip').length;

    const verdict =
      problems > 0
        ? { label: 'พบปัญหาที่ต้องแก้ไข', color: '#e2001a', text: 'text-brand', icon: FiXCircle }
        : warnings > 0
          ? { label: 'เข้ากันได้ (มีข้อควรระวัง)', color: '#f59e0b', text: 'text-amber-600', icon: FiAlertTriangle }
          : { label: 'เข้ากันได้ดีมาก', color: '#10b981', text: 'text-emerald-600', icon: FiCheckCircle };
    const VerdictIcon = verdict.icon;

    return (
      <>
        <div className="flex flex-col items-center">
          <ScoreRing value={result.score} max={result.maxScore} color={verdict.color}>
            <span className="text-4xl font-extrabold text-ink">{result.score}</span>
            <span className="text-xs font-medium text-slate-400">จาก {result.maxScore} คะแนน</span>
          </ScoreRing>
          <p className={cn('mt-2 flex items-center gap-1.5 text-sm font-bold', verdict.text)}>
            <VerdictIcon size={16} aria-hidden="true" />
            {verdict.label}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-emerald-600">
              {passed}/{result.checks.length}
            </p>
            <p className="text-[11px] font-medium text-emerald-700/80">ผ่านการตรวจสอบ</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-amber-600">{warnings}</p>
            <p className="text-[11px] font-medium text-amber-700/80">คำเตือน</p>
          </div>
          <div className={cn('rounded-lg border px-2 py-2.5 text-center', problems > 0 ? 'border-red-100 bg-red-50' : 'border-slate-200 bg-slate-50')}>
            <p className={cn('text-lg font-extrabold', problems > 0 ? 'text-brand' : 'text-slate-500')}>{problems}</p>
            <p className={cn('text-[11px] font-medium', problems > 0 ? 'text-brand/80' : 'text-slate-500')}>ปัญหาที่ต้องแก้</p>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 px-2 py-2.5 text-center">
            <p className="text-lg font-extrabold text-brand">{opportunities}</p>
            <p className="text-[11px] font-medium text-brand/80">โอกาสอัปเกรด</p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {result.checks.map((item) => {
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
                  {item.fix && item.status !== 'compatible' && (
                    <p className={cn('mt-0.5 text-xs font-medium', style.text)}>วิธีแก้: {item.fix}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
            <PiLightbulbFilamentFill size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <FiTrendingUp size={14} className="text-brand" aria-hidden="true" />
              {result.source === 'ai' ? 'AI Insight' : 'ข้อสังเกตจากระบบ'}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{result.insight}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          <h2 className="text-base font-bold text-ink">ผลการตรวจสอบความเข้ากันได้</h2>
          {result?.source === 'mock' && !isLoading && !stale && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">ผลจำลอง (Demo)</span>
          )}
        </div>

        {renderBody()}

        {result?.source === 'mock' && !isLoading && !stale && status !== 'failed' && (
          <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
            คำนวณจากข้อมูลสเปคสินค้าในระบบ ยังไม่ได้ตรวจสอบโดย AI จริง
          </p>
        )}
      </div>
    </div>
  );
}
