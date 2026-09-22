import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';
import { AnalysisSpecCard } from '../components/upgrade/AnalysisSpecCard';
import { CompatibilityScorePanel } from '../components/upgrade/CompatibilityScorePanel';
import { AiRecommendationPanel } from '../components/upgrade/AiRecommendationPanel';
import { RecommendedProductsSection } from '../components/upgrade/RecommendedProductsSection';
import { UpgradePromoBanner } from '../components/upgrade/UpgradePromoBanner';
import { categoryIcons } from '../components/home/categoryIcons';
import { useAppSelector } from '../app/hooks';
import { listUpgradeProducts } from '../services/upgrade/productSearchService';
import { upgradeSpecRows } from '../data/upgradeSpecRows';
import type { RecommendationTabKey } from '../data/upgradeAnalysisMock';
import type { RecommendationItem } from '../components/upgrade/RecommendationCard';
import type { UpgradeComponentKey } from '../types/upgrade';

// Illustrative AI copy per category — the compatibility engine itself is a TODO(backend),
// but this wording is just presentation and can stay static either way.
const reasonsByCategory: Partial<Record<UpgradeComponentKey, string[]>> = {
  cpu: ['เพิ่มประสิทธิภาพการประมวลผลได้สูงสุด', 'รองรับ Mainboard และ RAM ที่เลือกไว้', 'ลดปัญหาคอขวดกับการ์ดจอใหม่'],
  ram: ['เพิ่มความเร็วในการทำงานหลายโปรแกรมพร้อมกัน', 'ราคาคุ้มค่าเมื่อเทียบกับประสิทธิภาพที่ได้'],
  cooling: ['ระบายความร้อนได้ดีกว่าชุดเดิม', 'รองรับ CPU ที่อัปเกรดใหม่'],
  gpu: ['เพิ่มประสิทธิภาพการเล่นเกมและกราฟิก', 'ควรอัปเกรดหลังจาก CPU และ RAM พร้อม'],
  psu: ['รองรับกำลังไฟของการ์ดจอรุ่นใหม่ในอนาคต', 'เพิ่มความเสถียรให้ระบบโดยรวม'],
};

const primaryBadges: Partial<Record<UpgradeComponentKey, { label: string; className: string }>> = {
  cpu: { label: 'แนะนำมากที่สุด', className: 'bg-brand text-white' },
  ram: { label: 'คุ้มค่า', className: 'bg-emerald-500 text-white' },
  cooling: { label: 'เสริมระบบ', className: 'bg-slate-700 text-white' },
};

/**
 * Step 3 — AI analysis + compatibility check, one combined step (not two). Score/checklist
 * are illustrative (see upgradeAnalysisMock.ts, TODO(backend)); the current-spec column and
 * both recommendation lists are sourced from real Redux state and the real mock catalog.
 */
export function UpgradeAnalyzePage() {
  const navigate = useNavigate();
  const { currentSpec, upgrades } = useAppSelector((state) => state.upgrade);
  const [items, setItems] = useState<Record<RecommendationTabKey, RecommendationItem[]> | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listUpgradeProducts('cpu'),
      listUpgradeProducts('ram'),
      listUpgradeProducts('cooling'),
      listUpgradeProducts('gpu'),
      listUpgradeProducts('psu'),
    ]).then(([cpu, ram, cooling, gpu, psu]) => {
      if (cancelled) return;

      const toItem = (key: UpgradeComponentKey, product: (typeof cpu)[number] | undefined): RecommendationItem | null => {
        if (!product) return null;
        const badge = primaryBadges[key] ?? { label: 'ลำดับถัดไป', className: 'bg-slate-100 text-slate-600' };
        return {
          product,
          icon: categoryIcons[key],
          badgeLabel: badge.label,
          badgeClassName: badge.className,
          reasons: reasonsByCategory[key] ?? [],
        };
      };

      const skipKeys: UpgradeComponentKey[] = ['storage', 'case', 'motherboard'];
      const skipItems = skipKeys
        .map((key) => {
          const product = currentSpec[key];
          if (!product) return null;
          return {
            product,
            icon: categoryIcons[key],
            badgeLabel: 'ยังไม่จำเป็น',
            badgeClassName: 'bg-slate-100 text-slate-500',
            reasons: ['สเปคปัจจุบันยังเพียงพอสำหรับการใช้งาน'],
          } satisfies RecommendationItem;
        })
        .filter((item): item is RecommendationItem => item !== null);

      setItems({
        primary: [toItem('cpu', cpu[0]), toItem('ram', ram[0]), toItem('cooling', cooling[0])].filter(
          (item): item is RecommendationItem => item !== null,
        ),
        sequential: [toItem('gpu', gpu[0]), toItem('psu', psu[0])].filter((item): item is RecommendationItem => item !== null),
        skip: skipItems,
      });
    });

    return () => {
      cancelled = true;
    };
    // currentSpec only matters for the "skip" list's snapshot — re-running per keystroke isn't needed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasAnySpec = upgradeSpecRows.some((row) => currentSpec[row.key]);
  const goToSummary = () => navigate('/upgrade-pc/summary');
  const scrollToRecommended = () => {
    document.getElementById('recommended-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

            {items === null ? (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-white py-24 text-center text-sm text-slate-400 shadow-card">
                กำลังวิเคราะห์สเปคของคุณ...
              </div>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[300px_1fr_330px]">
                  <AnalysisSpecCard currentSpec={currentSpec} upgrades={upgrades} />
                  <CompatibilityScorePanel />
                  <AiRecommendationPanel items={items} onViewAll={scrollToRecommended} onContinue={goToSummary} />
                </div>

                <RecommendedProductsSection />
                <UpgradePromoBanner onContinue={goToSummary} />
              </>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
