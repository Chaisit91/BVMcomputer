import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryIcons } from '../home/categoryIcons';
import { cn } from '../../lib/cn';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { listUpgradeProducts } from '../../services/upgrade/productSearchService';
import { UpgradeProductCard } from './UpgradeProductCard';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

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

interface RecommendedProductsSectionProps {
  currentSpec: UpgradeSelection;
  /** Upgrade in effect per category (step-3 choice ?? step-2 product) — drives the ✓ / "เลือกแล้ว" state. */
  upgrades: UpgradeSelection;
  /** Step-3 choices only — the selections a second click removes (restoring the step-2 product). */
  upgradeSelections: UpgradeSelection;
  /** productIds the latest analysis recommends — only these get the recommendation badge. */
  recommendedIds: Set<string>;
  /** "AI แนะนำ" or "แนะนำ (Demo)", matching the analysis source. */
  recommendedLabel: string;
  /** Select/replace this product as its category's upgrade, or deselect it if it's the step-3 choice. */
  onToggle: (product: UpgradeProduct) => void;
}

/**
 * Bottom of step 3 — browse any category and pick a replacement part. Picking replaces that
 * category's upgrade (one per category); picking the same product again removes it and the
 * step-2 product is ticked again. It doesn't have to be one the AI recommended.
 */
export function RecommendedProductsSection({
  currentSpec,
  upgrades,
  upgradeSelections,
  recommendedIds,
  recommendedLabel,
  onToggle,
}: RecommendedProductsSectionProps) {
  const dispatch = useAppDispatch();
  const [activeKey, setActiveKey] = useState<UpgradeComponentKey>('cpu');
  const [loaded, setLoaded] = useState<{ key: UpgradeComponentKey; items: UpgradeProduct[] }>({ key: 'cpu', items: [] });

  useEffect(() => {
    let cancelled = false;
    listUpgradeProducts(activeKey)
      .then((items) => {
        if (!cancelled) setLoaded({ key: activeKey, items });
      })
      // Optional browsing section — on failure just leave it empty rather than blocking the page.
      .catch(() => {
        if (!cancelled) setLoaded({ key: activeKey, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [activeKey]);

  // Recomputed whenever the selection changes, so the product in effect — including a step-2
  // product that comes back after a deselect — is always on the grid with its ✓, even when it
  // isn't among the first few products.
  const chosenId = upgrades[activeKey]?.productId;
  const products = useMemo(() => {
    const items = loaded.key === activeKey ? loaded.items : [];
    const top = items.slice(0, GRID_SIZE);
    if (!chosenId || top.some((p) => p.productId === chosenId)) return top;
    const chosenItem = items.find((p) => p.productId === chosenId);
    return chosenItem ? [chosenItem, ...top.slice(0, GRID_SIZE - 1)] : top;
  }, [loaded, activeKey, chosenId]);

  const Icon = categoryIcons[activeKey];

  const handleAddToCart = (product: UpgradeProduct) => {
    dispatch(
      addToCart({
        id: product.productId,
        name: product.name,
        slug: product.productId,
        price: product.price,
        category: product.category,
        brand: product.brand,
        skuCode: product.sku,
        imageUrl: product.image,
      }),
    );
  };

  return (
    <div id="recommended-products" className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          สินค้าที่แนะนำสำหรับคุณ
        </h2>
        <Link to={`/category/${activeKey}`} className="text-sm font-semibold text-brand hover:text-brand-dark">
          ดูสินค้าทั้งหมด →
        </Link>
      </div>

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
          <UpgradeProductCard
            key={product.productId}
            product={product}
            icon={Icon}
            selected={upgrades[activeKey]?.productId === product.productId}
            // The step-2 product stays selected here; only a step-3 choice can be clicked off.
            lockSelection={!upgradeSelections[activeKey]}
            isCurrentPart={currentSpec[activeKey]?.productId === product.productId}
            badge={recommendedIds.has(product.productId) ? recommendedLabel : undefined}
            onToggle={() => onToggle(product)}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </div>
  );
}
