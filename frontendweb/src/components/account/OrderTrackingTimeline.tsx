import { FiCheck } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { TRACKING_STEPS, formatOrderDateTime, latestTrackingIndex } from './orderFormat';
import type { OrderTrackingEvent, OrderTrackingStep } from '../../types/api';

const DESCRIPTIONS: Record<OrderTrackingStep, string> = {
  picked_up: 'บริษัทขนส่งรับพัสดุจากร้านแล้ว',
  in_transit: 'พัสดุอยู่ระหว่างการขนส่งไปยังสาขาปลายทาง',
  out_for_delivery: 'พนักงานกำลังนำส่งพัสดุถึงคุณ',
  delivered: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว',
};

/** Vertical delivery timeline (order details view): reached steps are red with their time; the latest one has a soft ring. */
export function OrderTrackingTimeline({ events }: { events: OrderTrackingEvent[] }) {
  const reachedAt = new Map(events.map((event) => [event.step, event.at]));
  const latestIndex = latestTrackingIndex(new Set(reachedAt.keys()));

  return (
    <ol className="flex flex-col">
      {TRACKING_STEPS.map(({ step, label }, index) => {
        const at = reachedAt.get(step);
        const done = at !== undefined;
        const isLatest = index === latestIndex;
        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0" aria-current={isLatest ? 'step' : undefined}>
            {index < TRACKING_STEPS.length - 1 && (
              <span
                className={cn('absolute left-[13px] top-7 h-[calc(100%-28px)] w-0.5', index < latestIndex ? 'bg-brand' : 'bg-slate-200')}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
                done ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white',
                isLatest && 'ring-4 ring-red-100',
              )}
              aria-hidden="true"
            >
              {done && <FiCheck size={14} strokeWidth={3} />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn('text-sm font-semibold', done ? 'text-ink' : 'text-slate-400')}>{label}</p>
              <p className={cn('text-sm', done ? 'text-slate-500' : 'text-slate-400')}>{DESCRIPTIONS[step]}</p>
              {at && <p className="mt-0.5 text-xs text-[#7D879C]">{formatOrderDateTime(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
