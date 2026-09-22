import { FiCheck } from 'react-icons/fi';
import { cn } from '../../lib/cn';

// Exactly 4 steps — AI analysis and compatibility checking are one and the same step.
const steps = [
  { id: 1, title: 'กรอกสเปคคอมปัจจุบัน', subtitle: 'ระบุสเปคที่ใช้อยู่' },
  { id: 2, title: 'เลือกชิ้นส่วนอัปเกรด', subtitle: 'เลือกสินค้าที่ต้องการ' },
  { id: 3, title: 'AI วิเคราะห์', subtitle: 'ประมวลผลและให้คำแนะนำ' },
  { id: 4, title: 'สรุปและเพิ่มลงตะกร้า', subtitle: 'พร้อมสั่งซื้อได้ทันที' },
];

/**
 * Fixed-width columns (not content-width) so the connector lines and circles stay
 * evenly spaced regardless of each step's label length — same fix as the checkout
 * page's step indicator. Completed steps show a ✓ and turn the line after them red.
 */
export function UpgradeStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-5 flex items-start justify-center overflow-x-auto">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex w-20 flex-col items-center gap-1.5 text-center sm:w-36">
              <span
                className={cn(
                  'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  isActive || isDone ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500',
                )}
              >
                {isDone ? <FiCheck size={18} strokeWidth={3} aria-label="เสร็จสิ้น" /> : step.id}
              </span>
              <span
                className={cn('text-[13px] font-semibold', isActive ? 'text-brand' : isDone ? 'text-ink' : 'text-slate-400')}
              >
                {step.title}
              </span>
              <span className="hidden text-[12px] leading-snug text-slate-400 sm:block">{step.subtitle}</span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn('mt-[17px] h-0.5 w-6 shrink-0 rounded-full sm:w-10', isDone ? 'bg-brand' : 'bg-slate-300')}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
