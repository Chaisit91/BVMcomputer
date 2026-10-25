import { useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiXCircle } from 'react-icons/fi';
import { categoryIcons } from '../home/categoryIcons';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/cn';
import { formatTHB } from '../../lib/format';
import { RecommendationCard } from './RecommendationCard';
import type { RequestStatus } from '../../types/api';
import type { RecommendationTier, UpgradeAnalysisResult, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

const tabs: { key: RecommendationTier; label: string }[] = [
  { key: 'primary', label: 'แนะนำหลัก' },
  { key: 'sequential', label: 'อัปเกรดตามลำดับ' },
  { key: 'skip', label: 'ไม่จำเป็น' },
];

/** Why "สรุปการอัปเกรด" didn't go straight to step 4. */
export type ContinueNotice = { kind: 'stale' } | { kind: 'not-ready' } | { kind: 'problems'; count: number };

interface AiRecommendationPanelProps {
  result: UpgradeAnalysisResult | null;
  status: RequestStatus;
  stale: boolean;
  /** Upgrade in effect per category (step-3 choice ?? step-2 product) — drives "selected" and totals. */
  upgrades: UpgradeSelection;
  /** Step-3 choices only — the selections a second click removes (restoring the step-2 product). */
  upgradeSelections: UpgradeSelection;
  notice: ContinueNotice | null;
  /** Select/replace this product as its category's upgrade, or deselect it if it's the step-3 choice. */
  onToggle: (product: UpgradeProduct) => void;
  onReanalyze: () => void;
  onContinue: () => void;
  /** Proceed to step 4 despite reported compatibility problems (after the customer confirms). */
  onConfirmContinue: () => void;
  onDismissNotice: () => void;
}

/**
 * Right column of step 3 — AI recommendation tabs, then the re-analyse / continue actions.
 * Selecting a card sets that category's step-3 choice in the shared `upgrade` slice (selecting it
 * again removes it and the step-2 product returns), so every other part of the page (spec card,
 * product grid, totals, stale state) follows automatically.
 */
export function AiRecommendationPanel({
  result,
  status,
  stale,
  upgrades,
  upgradeSelections,
  notice,
  onToggle,
  onReanalyze,
  onContinue,
  onConfirmContinue,
  onDismissNotice,
}: AiRecommendationPanelProps) {
  const [activeTab, setActiveTab] = useState<RecommendationTier>('primary');
  const isLoading = status === 'loading';
  const items = result?.recommendations.filter((r) => r.tier === activeTab) ?? [];
  const sourceLabel = result?.source === 'ai' ? 'AI แนะนำ' : 'แนะนำ (Demo)';

  const picked = Object.values(upgrades).filter((p): p is UpgradeProduct => Boolean(p));
  const total = picked.reduce((sum, p) => sum + p.price, 0);

  return (
    <div id="ai-recommendation-panel" className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-20">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <h2 className="text-base font-bold text-ink">คำแนะนำจาก AI</h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const count = result?.recommendations.filter((r) => r.tier === tab.key).length ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                isActive ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-ink hover:border-brand hover:text-brand',
              )}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {stale && result && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-700">
          คำแนะนำด้านล่างอิงจากชุดสินค้าก่อนหน้า จะอัปเดตหลังกด “วิเคราะห์ใหม่”
        </p>
      )}

      <div className={cn('mt-3 flex flex-col gap-2.5', isLoading && 'pointer-events-none opacity-50')}>
        {!result && isLoading && <p className="py-8 text-center text-sm text-slate-400">กำลังเตรียมคำแนะนำ...</p>}
        {result && items.length === 0 && <p className="py-6 text-center text-sm text-slate-400">ไม่มีรายการในหมวดนี้</p>}
        {items.map((item) => (
          <RecommendationCard
            key={`${item.category}-${item.product.productId}`}
            product={item.product}
            icon={categoryIcons[item.category]}
            tier={item.tier}
            label={item.label}
            sourceLabel={sourceLabel}
            reasons={item.reasons}
            selected={upgrades[item.category]?.productId === item.product.productId}
            canDeselect={upgradeSelections[item.category]?.productId === item.product.productId}
            onToggle={() => onToggle(item.product)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-slate-500">ราคารวมชิ้นส่วนอัปเกรด ({picked.length} รายการ)</span>
          <span className="font-bold text-ink">{formatTHB(total)}</span>
        </div>

        <AnalysisStatusLine status={status} stale={stale} hasResult={Boolean(result)} />

        <button
          type="button"
          onClick={onReanalyze}
          disabled={isLoading}
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-xl border px-3 py-2 transition-colors disabled:cursor-wait disabled:opacity-60',
            stale ? 'border-brand bg-red-50 text-brand hover:bg-red-100' : 'border-brand bg-white text-brand hover:bg-red-50',
          )}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            {isLoading ? <Spinner size={15} /> : <FiRefreshCw size={15} aria-hidden="true" />}
            {isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ใหม่'}
          </span>
          <span className="text-[11px] text-slate-500">(หากมีการเปลี่ยนแปลงหลายรายการ)</span>
        </button>

        {notice && <ContinueNoticeBox notice={notice} onConfirm={onConfirmContinue} onDismiss={onDismissNotice} />}

        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
        >
          สรุปการอัปเกรด →
        </button>
      </div>
    </div>
  );
}

function AnalysisStatusLine({ status, stale, hasResult }: { status: RequestStatus; stale: boolean; hasResult: boolean }) {
  if (status === 'loading') return null;
  if (status === 'failed') {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
        <FiXCircle size={13} aria-hidden="true" />
        วิเคราะห์ไม่สำเร็จ — ลองกดวิเคราะห์ใหม่อีกครั้ง
      </p>
    );
  }
  if (stale) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <FiAlertTriangle size={13} aria-hidden="true" />
        มีการเปลี่ยนสินค้า — รอวิเคราะห์ใหม่
      </p>
    );
  }
  if (!hasResult) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
      <FiCheckCircle size={13} aria-hidden="true" />
      ผลวิเคราะห์ตรงกับรายการสินค้าล่าสุด
    </p>
  );
}

function ContinueNoticeBox({ notice, onConfirm, onDismiss }: { notice: ContinueNotice; onConfirm: () => void; onDismiss: () => void }) {
  if (notice.kind === 'problems') {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        <p className="flex items-start gap-1.5 font-semibold">
          <FiXCircle size={14} className="mt-px shrink-0" aria-hidden="true" />
          พบปัญหาความเข้ากันได้ {notice.count} จุด ชุดสินค้านี้ยังไม่พร้อมใช้งาน
        </p>
        <p className="mt-1 pl-5 text-red-600/90">แนะนำให้แก้ไขตามรายการตรวจสอบก่อน หากไปต่อ ชิ้นส่วนบางรายการอาจใช้งานร่วมกันไม่ได้</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onDismiss} className="h-9 rounded-lg border border-red-200 bg-white font-semibold text-ink hover:bg-red-100/50">
            กลับไปแก้ไข
          </button>
          <button type="button" onClick={onConfirm} className="h-9 rounded-lg bg-white font-semibold text-brand ring-1 ring-brand hover:bg-red-100/50">
            ดำเนินการต่อ
          </button>
        </div>
      </div>
    );
  }

  return (
    <p role="alert" className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
      <FiAlertTriangle size={14} className="mt-px shrink-0" aria-hidden="true" />
      {notice.kind === 'stale'
        ? 'มีการเปลี่ยนสินค้าที่ยังไม่ได้วิเคราะห์ กรุณากด “วิเคราะห์ใหม่” ก่อนสรุปการอัปเกรด'
        : 'ยังไม่มีผลวิเคราะห์ของชุดสินค้านี้ กรุณากด “วิเคราะห์ใหม่” ให้สำเร็จก่อน'}
    </p>
  );
}
