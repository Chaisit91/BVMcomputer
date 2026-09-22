import { FiArrowRight } from 'react-icons/fi';
import { PiSparkleFill } from 'react-icons/pi';

/** Closing banner for step 3 — same dark-gradient brand treatment used elsewhere on the site. */
export function UpgradePromoBanner({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0a0f1c] via-[#0b1220] to-black px-6 py-8 text-center sm:py-10">
      <span
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-[90px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -bottom-20 right-1/4 h-56 w-56 rounded-full bg-brand/10 blur-[90px]"
        aria-hidden="true"
      />

      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
        <PiSparkleFill size={12} aria-hidden="true" />
        AI Recommended
      </span>
      <h2 className="relative mt-3 text-2xl font-extrabold text-white sm:text-3xl">อัปเกรดคอมของคุณวันนี้</h2>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-slate-400">
        สรุปรายการอัปเกรดที่เลือกไว้ แล้วดำเนินการต่อไปยังตะกร้าได้ทันที
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        สรุปการอัปเกรด
        <FiArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}
