import { Link } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderThumbnail } from './OrderThumbnail';
import { formatBaht, formatOrderDateTime, summarizeOrderItems } from './orderFormat';
import type { OrderSummary } from '../../types/api';

const actionClass =
  'flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition-colors';

/** One order in "คำสั่งซื้อของฉัน": photo · number/date/items · status/total · action. Stacks on mobile. */
export function OrderCard({ order }: { order: OrderSummary }) {
  const path = `/account/orders/${encodeURIComponent(order.id)}`;
  const first = order.items[0];
  const tracking = order.status === 'shipping';

  return (
    <article className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5 md:grid-cols-[96px_minmax(0,1fr)_170px_168px] md:items-center md:gap-x-6">
      <OrderThumbnail src={first?.imageUrl} alt={first?.name ?? ''} className="h-[72px] w-[72px] md:h-24 md:w-24" />

      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-ink">#{order.orderNumber}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <FiCalendar size={14} className="shrink-0 text-[#7D879C]" aria-hidden="true" />
          สั่งซื้อเมื่อ {formatOrderDateTime(order.placedAt)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-[#2B3445]">{summarizeOrderItems(order.items)}</p>
      </div>

      <div className="col-span-2 flex items-end justify-between gap-3 md:col-span-1 md:flex-col md:items-start md:justify-center">
        <OrderStatusBadge status={order.status} />
        <div className="text-right md:text-left">
          <p className="text-xs text-slate-500">ยอดรวมสุทธิ</p>
          <p className="text-lg font-bold text-brand">{formatBaht(order.total)}</p>
        </div>
      </div>

      <div className="col-span-2 md:col-span-1">
        <Link
          to={path}
          className={cn(
            actionClass,
            tracking ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-brand bg-white text-brand hover:bg-red-50',
          )}
        >
          {tracking ? 'ติดตามพัสดุ' : 'ดูรายละเอียด'}
          <FiChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
