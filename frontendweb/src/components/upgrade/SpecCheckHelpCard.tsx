import { FiMonitor } from 'react-icons/fi';
import { SPEC_CHECK_GUIDE_URL } from '../../data/helpLinks';

/**
 * "ไม่รู้สเปกคอมของตัวเองใช่ไหม?" sidebar card on the PC-upgrade page — points customers who don't
 * know their parts to the spec-checking guide (opens in a new tab). Sized by its own content
 * only, so it never grows with the spec form next to it.
 */
export function SpecCheckHelpCard() {
  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-brand/30 bg-red-50/60 p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
          <FiMonitor size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink">ไม่รู้สเปกคอมของตัวเองใช่ไหม?</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            ดูวิธีเช็กสเปกง่าย ๆ ทีละขั้นตอน พร้อมภาพตัวอย่าง ไม่ต้องติดตั้งโปรแกรม
          </p>
        </div>
      </div>

      <a
        href={SPEC_CHECK_GUIDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
      >
        ดูวิธีตรวจสอบสเปกคอม →
      </a>
    </div>
  );
}
