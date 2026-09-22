import { useEffect, useState } from 'react';
import { categoryIcons } from '../home/categoryIcons';
import { cn } from '../../lib/cn';
import { listUpgradeProducts } from '../../services/upgrade/productSearchService';
import { RecommendedProductCard } from './RecommendedProductCard';
import type { UpgradeComponentKey, UpgradeProduct } from '../../types/upgrade';

const tabs: { key: UpgradeComponentKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'motherboard', label: 'Mainboard' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'psu', label: 'PSU' },
  { key: 'cooling', label: 'CPU Cooler' },
  { key: 'case', label: 'Case' },
];

const GRID_SIZE = 6;

/** Bottom of step 3 — a browsable catalog grid, separate from the AI's picks above it. */
export function RecommendedProductsSection() {
  const [activeKey, setActiveKey] = useState<UpgradeComponentKey>('cpu');
  const [products, setProducts] = useState<UpgradeProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    listUpgradeProducts(activeKey).then((items) => {
      if (!cancelled) setProducts(items.slice(0, GRID_SIZE));
    });
    return () => {
      cancelled = true;
    };
  }, [activeKey]);

  const Icon = categoryIcons[activeKey];

  return (
    <div id="recommended-products" className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
        <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        สินค้าที่แนะนำสำหรับคุณ
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveKey(tab.key)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-ink hover:border-brand hover:text-brand',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <RecommendedProductCard key={product.productId} product={product} icon={Icon} />
        ))}
      </div>
    </div>
  );
}
