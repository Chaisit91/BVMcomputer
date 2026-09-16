import { cn } from '../../lib/cn';

const steps = [
  { id: 1, title: 'กรอกสเปคปัจจุบัน', subtitle: 'ระบุสเปคคอมของคุณ' },
  { id: 2, title: 'AI วิเคราะห์', subtitle: 'ประมวลผลและให้คำแนะนำ' },
  { id: 3, title: 'เลือกชิ้นส่วนอัปเกรด', subtitle: 'ดูสินค้าแนะนำ' },
  { id: 4, title: 'ตรวจสอบความเข้ากันได้', subtitle: 'เช็กปัญหาและคำแนะนำเพิ่มเติม' },
  { id: 5, title: 'สรุปและเพิ่มลงตะกร้า', subtitle: 'พร้อมสั่งซื้อได้ทันที' },
];

/**
 * Fixed-width columns (not content-width) so the connector lines and circles stay
 * evenly spaced regardless of each step's label length — same fix as the checkout
 * page's step indicator.
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
                {step.id}
              </span>
              <span className={cn('text-[13px] font-semibold', isActive ? 'text-brand' : 'text-slate-400')}>{step.title}</span>
              <span className="hidden text-[12px] leading-snug text-slate-400 sm:block">{step.subtitle}</span>
            </div>
            {index < steps.length - 1 && (
              <span className="mt-[17px] h-0.5 w-6 shrink-0 rounded-full bg-slate-300 sm:w-10" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
