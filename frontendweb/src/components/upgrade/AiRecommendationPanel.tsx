import { useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { recommendationTabs, type RecommendationTabKey } from '../../data/upgradeAnalysisMock';
import { RecommendationCard, type RecommendationItem } from './RecommendationCard';

interface AiRecommendationPanelProps {
  items: Record<RecommendationTabKey, RecommendationItem[]>;
  onViewAll: () => void;
  onContinue: () => void;
}

/**
 * Right column of step 3 — the three recommendation tabs plus the two actions that move
 * the flow forward: browse the full recommended list (scrolls down), or continue to step 4.
 */
export function AiRecommendationPanel({ items, onViewAll, onContinue }: AiRecommendationPanelProps) {
  const [activeTab, setActiveTab] = useState<RecommendationTabKey>('primary');
  const activeItems = items[activeTab];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-20">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <h2 className="text-base font-bold text-ink">คำแนะนำจาก AI</h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {recommendationTabs.map((tab) => {
          const isActive = tab.key === activeTab;
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
              {tab.label} ({items[tab.key].length})
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {activeItems.map((item) => (
          <RecommendationCard key={item.product.productId} {...item} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onViewAll}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-brand text-sm font-semibold text-brand transition-colors hover:bg-red-50"
        >
          <FiShoppingBag size={16} aria-hidden="true" />
          ดูสินค้าที่แนะนำทั้งหมด
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          สรุปการอัปเกรด →
        </button>
      </div>
    </div>
  );
}
