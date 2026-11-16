import { useEffect, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { BsTruck } from 'react-icons/bs';
import { FiBox, FiCalendar, FiCheck, FiCheckCircle, FiChevronUp, FiClipboard, FiClock, FiMapPin, FiPackage, FiPhone, FiTruck } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { OrderThumbnail } from './OrderThumbnail';
import { TRACKING_STEPS, formatDeliveryEstimate, formatOrderDate, formatOrderDateTime, formatUpdateTime, latestTrackingIndex } from './orderFormat';
import type { OrderDetail } from '../../types/api';

const cardClass = 'rounded-2xl border border-slate-200 bg-white shadow-card';

/** "ติดตามพัสดุ" content: status + ETA, parcel info, milestones, carrier updates, address, items. */
export function OrderTrackingView({ order }: { order: OrderDetail }) {
  const reached = new Map(order.trackingEvents.map((event) => [event.step, event.at]));
  const latestIndex = latestTrackingIndex(new Set(reached.keys()));

  return (
    <>
      <StatusCard order={order} latestIndex={latestIndex} deliveredAt={reached.get('delivered') ?? null} />
      <ParcelCard order={order} />

      {/*
        Two rows × two columns (60/40). Each row stretches both cells to the taller one, so
        row 1 (milestones | address) shares top and bottom edges.
        Row 2: the update history alone sets the row height. From lg up the items card is taken out
        of flow at the top of its (stretched) cell, so it adds nothing to the row height; it is only
        as tall as its items, capped at the cell (`max-h-full`). Once capped, only its list scrolls —
        the heading stays put. Pure CSS, so the cap follows the history as it grows.
        DOM order = mobile order: milestones, address, history, items (natural height on mobile).
      */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card icon={FiTruck} title="สถานะการจัดส่ง" centerBody>
          <StepTimeline reached={reached} latestIndex={latestIndex} />
        </Card>

        <CollapsibleCard icon={FiMapPin} title="ข้อมูลการจัดส่ง">
            {order.shippingAddress ? (
              <div className="text-sm">
                <p className="font-semibold text-ink">ที่อยู่จัดส่ง</p>
                <p className="mt-1 text-[#2B3445]">
                  {order.shippingAddress.recipientName} <span className="text-slate-500">({order.shippingAddress.phone})</span>
                </p>
                <p className="mt-0.5 text-slate-500">{order.shippingAddress.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">ไม่มีข้อมูลที่อยู่จัดส่งในคำสั่งซื้อนี้</p>
            )}
          </CollapsibleCard>

        <Card icon={FiClock} title="ประวัติการอัปเดตล่าสุด">
          <UpdateHistory order={order} />
        </Card>

        <div className="min-w-0 lg:relative">
          <CollapsibleCard
            icon={FiBox}
            title="รายการสินค้าในกล่อง"
            count={order.items.length}
            className="lg:absolute lg:inset-x-0 lg:top-0 lg:max-h-full"
            scrollBody
          >
            {/* First/last rows trim their edge padding (same look as the old -my-2), so the list never reports phantom overflow. */}
            <ul className="flex flex-col divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex items-center gap-3 py-2.5 first:pt-0.5 last:pb-0.5">
                  <OrderThumbnail src={item.imageUrl} alt={item.name} className="h-14 w-14" />
                  <p className="min-w-0 flex-1 text-sm text-[#2B3445]">{item.name}</p>
                  <p className="shrink-0 text-sm font-semibold text-ink">x {item.quantity}</p>
                </li>
              ))}
            </ul>
          </CollapsibleCard>
        </div>
      </div>
    </>
  );
}

function StatusCard({ order, latestIndex, deliveredAt }: { order: OrderDetail; latestIndex: number; deliveredAt: string | null }) {
  const current = latestIndex >= 0 ? TRACKING_STEPS[latestIndex].status : 'รอบริษัทขนส่งเข้ารับพัสดุ (Preparing)';
  const delivered = deliveredAt !== null;

  let dateLabel = 'วันที่คาดว่าจะได้รับ';
  let dateText = 'จะแจ้งให้ทราบเมื่อบริษัทขนส่งประเมินวันจัดส่ง';
  if (delivered) {
    dateLabel = 'ได้รับพัสดุเมื่อ';
    dateText = formatOrderDateTime(deliveredAt);
  } else if (order.estimatedDeliveryBy) {
    dateText = formatDeliveryEstimate(order.estimatedDeliveryBy);
  }

  return (
    <div className={cn(cardClass, 'grid grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] md:items-center md:gap-6')}>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          {delivered ? <FiCheckCircle size={26} aria-hidden="true" /> : <BsTruck size={26} aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">สถานะปัจจุบัน</p>
          <p className="text-lg font-bold leading-snug text-ink sm:text-xl">{current}</p>
        </div>
      </div>

      <span className="h-px w-full bg-slate-100 md:h-14 md:w-px" aria-hidden="true" />

      <div className="flex items-center gap-4">
        <span className="flex w-8 shrink-0 items-center justify-center text-brand">
          <FiCalendar size={28} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{dateLabel}</p>
          <p className="mt-1 inline-block rounded-lg bg-red-50 px-3 py-1.5 text-base font-bold text-ink sm:text-lg">{dateText}</p>
        </div>
      </div>
    </div>
  );
}

function ParcelCard({ order }: { order: OrderDetail }) {
  return (
    <div className={cn(cardClass, 'grid grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1fr)] md:gap-6')}>
      <InfoItem icon={FiPackage} label="หมายเลขคำสั่งซื้อ">
        #{order.orderNumber}
      </InfoItem>
      <InfoItem icon={FiClipboard} label="เลขติดตามพัสดุ">
        {order.trackingNumber ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="break-all">{order.trackingNumber}</span>
            <CopyButton value={order.trackingNumber} />
          </span>
        ) : (
          <span className="font-normal text-slate-500">ยังไม่มีเลขพัสดุ</span>
        )}
      </InfoItem>
      <InfoItem icon={FiTruck} label="บริษัทขนส่ง">
        {order.carrier ? (
          <span>
            {order.carrier.name}
            {order.carrier.phone && (
              <a href={`tel:${order.carrier.phone}`} className="ml-1.5 inline-flex items-center gap-1 font-normal text-slate-500 hover:text-brand">
                <FiPhone size={13} aria-hidden="true" />
                โทร. {order.carrier.phone}
              </a>
            )}
          </span>
        ) : (
          <span className="font-normal text-slate-500">ยังไม่ได้ส่งมอบให้ขนส่ง</span>
        )}
      </InfoItem>
    </div>
  );
}

function InfoItem({ icon: Icon, label, children }: { icon: IconType; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex w-7 shrink-0 items-center justify-center text-brand">
        <Icon size={24} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm font-bold text-ink sm:text-base">{children}</div>
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      // Clipboard API is blocked on plain-http pages and some browsers — fall back to a hidden textarea.
      setState(copyWithTextarea(value) ? 'copied' : 'failed');
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-[#2B3445] transition-colors hover:border-brand/40 hover:text-brand"
    >
      {state === 'copied' ? <FiCheck size={14} className="text-emerald-600" aria-hidden="true" /> : <FiClipboard size={14} aria-hidden="true" />}
      <span aria-live="polite">{state === 'copied' ? 'คัดลอกแล้ว' : state === 'failed' ? 'คัดลอกไม่สำเร็จ' : 'คัดลอกเลขพัสดุ'}</span>
    </button>
  );
}

function copyWithTextarea(value: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

/** Same padding and heading row on every card, so titles and icons line up across the columns. */
const sectionClass = cn(cardClass, 'flex min-w-0 flex-col p-4 sm:p-5');
const headingClass = 'flex min-h-7 items-center gap-2 text-base font-bold text-ink';

/** `centerBody`: when the row is taller than the content, keep it vertically centred instead of top-heavy. */
function Card({ icon: Icon, title, centerBody, children }: { icon: IconType; title: string; centerBody?: boolean; children: ReactNode }) {
  return (
    <section className={sectionClass}>
      <h2 className={headingClass}>
        <Icon size={18} className="shrink-0 text-brand" aria-hidden="true" />
        {title}
      </h2>
      <div className={cn('mt-4 flex flex-1 flex-col', centerBody && 'justify-center')}>{children}</div>
    </section>
  );
}

function CollapsibleCard({
  icon: Icon,
  title,
  count,
  className,
  scrollBody,
  children,
}: {
  icon: IconType;
  title: string;
  count?: number;
  className?: string;
  /** From lg up, the body scrolls once the card hits its max height; the heading stays put. */
  scrollBody?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className={cn(sectionClass, className)}>
      <h2 className={headingClass}>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 text-left">
          <Icon size={18} className="shrink-0 text-brand" aria-hidden="true" />
          <span className="flex-1">
            {title}
            {count !== undefined && <span className="ml-1.5 font-normal text-slate-500">({count} รายการ)</span>}
          </span>
          <FiChevronUp size={18} className={cn('shrink-0 text-[#7D879C] transition-transform', !open && 'rotate-180')} aria-hidden="true" />
        </button>
      </h2>
      {open && (
        <div className={cn('mt-3 border-t border-slate-100 pt-3', scrollBody && 'lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain')}>
          {children}
        </div>
      )}
    </section>
  );
}

/** Horizontal milestones: done = red check, current = larger red truck with a ring, pending = grey outline. */
function StepTimeline({ reached, latestIndex }: { reached: Map<string, string>; latestIndex: number }) {
  return (
    <ol className="grid grid-cols-4">
      {TRACKING_STEPS.map(({ step, label }, index) => {
        const at = reached.get(step);
        const isCurrent = index === latestIndex && step !== 'delivered';
        const done = at !== undefined;
        return (
          <li key={step} className="relative flex flex-col items-center text-center" aria-current={index === latestIndex ? 'step' : undefined}>
            {index > 0 && (
              <span
                className={cn('absolute right-1/2 top-[19px] h-0.5 w-full', index <= latestIndex ? 'bg-brand' : 'bg-slate-200')}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 flex h-10 items-center">
              {isCurrent ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white ring-4 ring-red-100">
                  <BsTruck size={18} aria-hidden="true" />
                </span>
              ) : (
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2',
                    done ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-300',
                  )}
                >
                  <FiCheck size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </span>
            <p className={cn('mt-2 text-xs font-semibold sm:text-sm', isCurrent ? 'text-brand' : done ? 'text-ink' : 'text-slate-500')}>{label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{at ? formatOrderDate(at) : 'รอการยืนยัน'}</p>
          </li>
        );
      })}
    </ol>
  );
}

function UpdateHistory({ order }: { order: OrderDetail }) {
  if (order.trackingUpdates.length === 0) {
    return <p className="text-sm text-slate-500">ยังไม่มีการอัปเดตจากบริษัทขนส่ง</p>;
  }
  return (
    <ol className="flex flex-col">
      {order.trackingUpdates.map((update, index) => {
        const latest = index === 0;
        return (
          <li key={`${update.at}-${index}`} className="relative flex gap-3 pb-2 last:pb-0">
            {index < order.trackingUpdates.length - 1 && (
              <span className={cn('absolute left-[7px] top-6 h-[calc(100%-12px)] w-0.5', latest ? 'bg-brand' : 'bg-slate-200')} aria-hidden="true" />
            )}
            <span
              className={cn(
                'relative z-10 mt-3 h-4 w-4 shrink-0 rounded-full border-2',
                latest ? 'border-brand bg-brand ring-4 ring-red-100' : 'border-slate-300 bg-white',
              )}
              aria-hidden="true"
            />
            <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2', latest && 'bg-red-50')}>
              <p className={cn('text-xs font-semibold sm:text-sm', latest ? 'text-brand' : 'text-slate-500')}>{formatUpdateTime(update.at)}</p>
              <p className="text-sm font-semibold text-ink">{update.description}</p>
              {update.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:text-sm">
                  <FiMapPin size={13} className="shrink-0" aria-hidden="true" />
                  สถานที่: {update.location}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
