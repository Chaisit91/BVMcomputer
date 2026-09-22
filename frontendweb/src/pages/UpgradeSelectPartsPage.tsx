import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiFilter } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { ProductPagination } from '../components/category/ProductPagination';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { UpgradeProductCard } from '../components/upgrade/UpgradeProductCard';
import { UpgradeCurrentSpecSidebar } from '../components/upgrade/UpgradeCurrentSpecSidebar';
import { categoryIcons } from '../components/home/categoryIcons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import { clearUpgrades, removeUpgrade, toggleUpgrade } from '../features/upgrade/upgradeSlice';
import { listUpgradeProducts } from '../services/upgrade/productSearchService';
import { cn } from '../lib/cn';
import type { UpgradeComponentKey, UpgradeProduct } from '../types/upgrade';

// Mainboard isn't a tab here on purpose — it appears in the sidebar as part of the current
// spec, but swapping it isn't offered in this step.
const tabs: { key: UpgradeComponentKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'psu', label: 'PSU' },
  { key: 'cooling', label: 'CPU Cooler' },
  { key: 'case', label: 'Case' },
];

type SortKey = 'recommended' | 'price-asc' | 'price-desc';

const priceCaps = [
  { value: 5000, label: 'ไม่เกิน ฿5,000' },
  { value: 10000, label: 'ไม่เกิน ฿10,000' },
  { value: 20000, label: 'ไม่เกิน ฿20,000' },
  { value: 50000, label: 'ไม่เกิน ฿50,000' },
];

// The mock catalog only has a handful of items per category, but the real one is much bigger —
// same decorative pagination approach the category listing pages use until the backend has it.
const PAGE_SIZE = 12;
const MOCK_TOTAL_ITEMS = 96;

/**
 * Step 2 of the upgrade flow — pick the actual products that should replace the customer's
 * current parts. Picks live in the shared `upgrade` slice (max one per category, click again
 * to un-pick), and the sidebar shows the resulting old → new spec in real time.
 */
export function UpgradeSelectPartsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSpec, upgrades } = useAppSelector((state) => state.upgrade);

  const [activeKey, setActiveKey] = useState<UpgradeComponentKey>('cpu');
  const [loaded, setLoaded] = useState<{ key: UpgradeComponentKey; items: UpgradeProduct[] } | null>(null);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUpgradeProducts(activeKey).then((items) => {
      if (!cancelled) setLoaded({ key: activeKey, items });
    });
    return () => {
      cancelled = true;
    };
  }, [activeKey]);

  // Only trust products that belong to the tab currently open (avoids a one-frame flash of
  // the previous tab's items while the next category is loading).
  const products = loaded?.key === activeKey ? loaded.items : null;

  const brandOptions = useMemo(() => Array.from(new Set((products ?? []).map((p) => p.brand))).sort(), [products]);

  const visibleProducts = useMemo(() => {
    let list = products ?? [];
    if (brands.length > 0) list = list.filter((p) => brands.includes(p.brand));
    if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list.slice(0, PAGE_SIZE);
  }, [products, brands, maxPrice, sort]);

  const activeFilterCount = brands.length + (maxPrice !== null ? 1 : 0);
  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
  const Icon = categoryIcons[activeKey];

  const handleTabChange = (key: UpgradeComponentKey) => {
    setActiveKey(key);
    setPage(1);
    setBrands([]);
    setMaxPrice(null);
  };

  const toggleBrand = (brand: string) => {
    setBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
    setPage(1);
  };

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
    <section className="bg-slate-50 pb-10 pt-6">
      <Container>
        <UpgradeStepIndicator currentStep={2} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold text-ink">
              <span className="h-7 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              เลือกชิ้นส่วนที่ต้องการอัปเกรด
            </h1>
            <p className="mt-1 pl-4 text-sm text-slate-500">
              เลือกสินค้าที่คุณสนใจได้ด้วยตัวเอง จากนั้น AI จะช่วยตรวจสอบความเหมาะสมในขั้นตอนถัดไป
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const TabIcon = categoryIcons[tab.key];
                const isActive = tab.key === activeKey;
                const hasPick = Boolean(upgrades[tab.key]);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleTabChange(tab.key)}
                    className={cn(
                      'flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors',
                      isActive
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-200 bg-white text-ink hover:border-brand hover:text-brand',
                    )}
                  >
                    <TabIcon size={16} aria-hidden="true" />
                    {tab.label}
                    {hasPick && (
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full',
                          isActive ? 'bg-white text-brand' : 'bg-brand text-white',
                        )}
                        aria-label="เลือกแล้ว"
                      >
                        <FiCheck size={10} strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
                    <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                    {activeTab.label}
                  </h2>
                  <p className="mt-0.5 pl-4 text-sm text-slate-400">
                    เลือก {activeTab.label} ที่ต้องการอัปเกรด (เลือกได้ 1 รายการ)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
                    เรียงตาม:
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="bg-transparent font-medium text-ink outline-none"
                    >
                      <option value="recommended">แนะนำ</option>
                      <option value="price-asc">ราคาต่ำ → สูง</option>
                      <option value="price-desc">ราคาสูง → ต่ำ</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    aria-expanded={filterOpen}
                    onClick={() => setFilterOpen((open) => !open)}
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                      filterOpen || activeFilterCount > 0
                        ? 'border-brand text-brand'
                        : 'border-slate-200 text-ink hover:border-brand hover:text-brand',
                    )}
                  >
                    ตัวกรอง
                    {activeFilterCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                    <FiFilter size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {filterOpen && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500">แบรนด์</p>
                    <div className="flex flex-wrap gap-2">
                      {brandOptions.map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          aria-pressed={brands.includes(brand)}
                          onClick={() => toggleBrand(brand)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            brands.includes(brand)
                              ? 'border-brand bg-brand text-white'
                              : 'border-slate-200 bg-white text-ink hover:border-brand',
                          )}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      ราคา
                      <select
                        value={maxPrice ?? ''}
                        onChange={(e) => setMaxPrice(e.target.value === '' ? null : Number(e.target.value))}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-ink outline-none focus:border-brand"
                      >
                        <option value="">ไม่จำกัด</option>
                        {priceCaps.map((cap) => (
                          <option key={cap.value} value={cap.value}>
                            {cap.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setBrands([]);
                          setMaxPrice(null);
                        }}
                        className="text-xs font-medium text-brand hover:text-brand-dark"
                      >
                        ล้างตัวกรอง
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4">
                {products === null ? (
                  <div className="py-16 text-center text-sm text-slate-400">กำลังโหลดสินค้า...</div>
                ) : visibleProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
                    ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <UpgradeProductCard
                        key={product.productId}
                        product={product}
                        icon={Icon}
                        selected={upgrades[activeKey]?.productId === product.productId}
                        onToggle={() => dispatch(toggleUpgrade({ key: activeKey, product }))}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <ProductPagination
              currentPage={page}
              totalPages={Math.ceil(MOCK_TOTAL_ITEMS / PAGE_SIZE)}
              pageSize={PAGE_SIZE}
              totalItems={MOCK_TOTAL_ITEMS}
              onPageChange={setPage}
            />
          </div>

          <UpgradeCurrentSpecSidebar
            currentSpec={currentSpec}
            upgrades={upgrades}
            onRemoveUpgrade={(key) => dispatch(removeUpgrade(key))}
            onClearUpgrades={() => dispatch(clearUpgrades())}
            onContinue={() => navigate('/upgrade-pc/analyze')}
          />
        </div>
      </Container>
    </section>
  );
}
