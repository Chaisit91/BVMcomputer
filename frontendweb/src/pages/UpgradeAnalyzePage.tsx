import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { AnalysisSpecCard } from '../components/upgrade/AnalysisSpecCard';
import { CompatibilityScorePanel } from '../components/upgrade/CompatibilityScorePanel';
import { AiRecommendationPanel, type ContinueNotice } from '../components/upgrade/AiRecommendationPanel';
import { RecommendedProductsSection } from '../components/upgrade/RecommendedProductsSection';
import { UpgradePromoBanner } from '../components/upgrade/UpgradePromoBanner';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleUpgradeSelection } from '../features/upgrade/upgradeSlice';
import { selectEffectiveUpgrades } from '../features/upgrade/upgradeSelectors';
import { runUpgradeAnalysis, selectIsAnalysisStale } from '../features/upgrade/upgradeAnalysisSlice';
import { upgradeSpecRows } from '../data/upgradeSpecRows';
import type { UpgradeProduct } from '../types/upgrade';

/**
 * Step 3 — AI analysis + compatibility check. The `upgrade` slice keeps the step-2 products
 * (`upgrades`, never changed here) and this page's choices (`upgradeSelections`) apart; every
 * panel reads the effective build (choice ?? step-2 product), so the sidebar, AI cards, product
 * grid, totals and "needs re-analysis" state always agree. Removing a step-3 choice brings the
 * step-2 product back everywhere. Analysis runs on entry and then only on "วิเคราะห์ใหม่".
 */
export function UpgradeAnalyzePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSpec, upgradeSelections } = useAppSelector((state) => state.upgrade);
  const upgrades = useAppSelector(selectEffectiveUpgrades);
  const { status, error, result } = useAppSelector((state) => state.upgradeAnalysis);
  const stale = useAppSelector(selectIsAnalysisStale);
  const [notice, setNotice] = useState<ContinueNotice | null>(null);

  const hasAnySpec = upgradeSpecRows.some((row) => currentSpec[row.key]);

  // On entry: analyse if there's no result yet, or the build was changed back in step 2.
  // Afterwards, part changes on this page only mark the result stale — the customer can change
  // several parts and re-analyse once.
  useEffect(() => {
    if (hasAnySpec && (!result || stale)) void dispatch(runUpgradeAnalysis());
    // Mount only — later changes are re-analysed on request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommendedIds = useMemo(
    () => new Set(result?.recommendations.filter((r) => r.tier !== 'skip').map((r) => r.product.productId) ?? []),
    [result],
  );

  // Same rule from the AI panel and the product grid: new product = select/replace,
  // same product again = deselect, which brings back the step-2 product for that category.
  const handleToggle = (product: UpgradeProduct) => {
    dispatch(toggleUpgradeSelection({ key: product.category, product }));
    setNotice(null);
  };

  const handleReanalyze = () => {
    setNotice(null);
    void dispatch(runUpgradeAnalysis());
  };

  const showNotice = (next: ContinueNotice) => {
    setNotice(next);
    document.getElementById('ai-recommendation-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Step 4 only with an up-to-date, successful analysis; serious problems need explicit confirmation.
  const handleContinue = () => {
    if (status === 'loading') return;
    if (stale) return showNotice({ kind: 'stale' });
    if (status !== 'succeeded' || !result) return showNotice({ kind: 'not-ready' });
    const problems = result.checks.filter((c) => c.status === 'incompatible').length;
    if (problems > 0) return showNotice({ kind: 'problems', count: problems });
    navigate('/upgrade-pc/summary');
  };

  return (
    <section className="bg-slate-50 pb-16 pt-6">
      <Container>
        <UpgradeStepIndicator currentStep={3} />

        {!hasAnySpec ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-card">
            <h1 className="text-xl font-bold text-ink">ยังไม่มีข้อมูลสเปคให้วิเคราะห์</h1>
            <p className="text-sm text-slate-400">กรุณากรอกสเปคคอมปัจจุบันและเลือกชิ้นส่วนที่ต้องการอัปเกรดก่อน</p>
            <Link
              to="/upgrade-pc"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <FiArrowLeft size={15} aria-hidden="true" />
              เริ่มกรอกสเปค
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-bold text-ink">
                  <span className="h-7 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                  ผลการวิเคราะห์สเปคด้วย AI
                </h1>
                <p className="mt-1 pl-4 text-sm text-slate-500">
                  ตรวจสอบความเข้ากันได้ของชิ้นส่วนที่เลือก พร้อมคำแนะนำเพิ่มเติมจาก AI
                </p>
              </div>
              <Link
                to="/upgrade-pc/select"
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <FiArrowLeft size={15} aria-hidden="true" />
                กลับไปแก้ไข
              </Link>
            </div>

            {/* No items-start here on purpose: the columns differ in height, and stretching
                each grid cell to the row's full height gives the sticky panels below room to
                travel and release at the right time instead of unsticking early and jumping. */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[300px_1fr_330px]">
              <div>
                <AnalysisSpecCard currentSpec={currentSpec} upgrades={upgrades} />
              </div>
              <CompatibilityScorePanel status={status} error={error} result={result} stale={stale} onRetry={handleReanalyze} />
              <div className="md:col-span-2 lg:col-span-1">
                <AiRecommendationPanel
                  result={result}
                  status={status}
                  stale={stale}
                  upgrades={upgrades}
                  upgradeSelections={upgradeSelections}
                  notice={notice}
                  onToggle={handleToggle}
                  onReanalyze={handleReanalyze}
                  onContinue={handleContinue}
                  onConfirmContinue={() => navigate('/upgrade-pc/summary')}
                  onDismissNotice={() => setNotice(null)}
                />
              </div>
            </div>

            <RecommendedProductsSection
              currentSpec={currentSpec}
              upgrades={upgrades}
              upgradeSelections={upgradeSelections}
              recommendedIds={recommendedIds}
              recommendedLabel={result?.source === 'ai' ? 'AI แนะนำ' : 'แนะนำ (Demo)'}
              onToggle={handleToggle}
            />
            <UpgradePromoBanner onContinue={handleContinue} />
          </>
        )}
      </Container>
    </section>
  );
}
