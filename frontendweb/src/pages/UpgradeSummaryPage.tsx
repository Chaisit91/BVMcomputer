import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { UpgradeStepIndicator } from '../components/upgrade/UpgradeStepIndicator';

/**
 * Placeholder for step 4 (สรุปและเพิ่มลงตะกร้า). TODO(backend): a teammate owns the real order
 * summary — this page only exists so step 3's "สรุปการอัปเกรด" button lands somewhere real.
 */
export function UpgradeSummaryPage() {
  return (
    <section className="bg-slate-50 pb-16 pt-6">
      <Container>
        <UpgradeStepIndicator currentStep={4} />

        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-card">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-brand">
            <FiShoppingCart size={28} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-ink">หน้าสรุปการอัปเกรดกำลังจะมาเร็วๆ นี้</h1>
          <p className="text-sm text-slate-400">
            เมื่อพร้อม ระบบจะสรุปรายการอัปเกรดทั้งหมดและให้คุณเพิ่มลงตะกร้าได้จากที่นี่
          </p>
          <Link
            to="/upgrade-pc/analyze"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <FiArrowLeft size={15} aria-hidden="true" />
            กลับไปดูผลวิเคราะห์
          </Link>
        </div>
      </Container>
    </section>
  );
}
