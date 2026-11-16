import { useEffect, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BsBoxSeamFill, BsTruck } from 'react-icons/bs';
import { FiArrowLeft, FiCalendar, FiPackage } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { OrderStatusBadge } from '../components/account/OrderStatusBadge';
import { OrderThumbnail } from '../components/account/OrderThumbnail';
import { OrderTrackingTimeline } from '../components/account/OrderTrackingTimeline';
import { OrderTrackingView } from '../components/account/OrderTrackingView';
import { RequireLogin } from '../components/account/RequireLogin';
import { formatBaht, formatOrderDateTime } from '../components/account/orderFormat';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrderDetail } from '../features/orderHistory/orderHistorySlice';
import type { OrderDetail } from '../types/api';

type View = 'details' | 'tracking';

/**
 * One order. `/account/orders/:id` opens on the items and totals ("ดูรายละเอียด");
 * `/account/orders/:id/tracking` opens on the delivery timeline ("ติดตามพัสดุ").
 */
export function AccountOrderDetailPage({ view }: { view: View }) {
  return (
    <RequireLogin>
      <OrderDetailContent view={view} />
    </RequireLogin>
  );
}

const backLink = (
  <Link
    to="/account/orders"
    className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#2B3445] transition-colors hover:bg-slate-50"
  >
    <FiArrowLeft size={16} aria-hidden="true" />
    กลับไปคำสั่งซื้อ
  </Link>
);

function OrderDetailContent({ view }: { view: View }) {
  const dispatch = useAppDispatch();
  const { orderId = '' } = useParams();
  const entry = useAppSelector((state) => state.orderHistory.details[orderId]);

  useEffect(() => {
    if (orderId) void dispatch(fetchOrderDetail({ id: orderId }));
  }, [dispatch, orderId]);

  const tracking = view === 'tracking';
  const order = entry?.status === 'succeeded' ? entry.order : null;

  const renderBody = () => {
    if (entry?.status === 'failed') {
      return entry.notFound ? (
        <EmptyState icon={FiPackage} title="ไม่พบคำสั่งซื้อนี้" description="คำสั่งซื้ออาจถูกลบไปแล้ว หรือไม่ได้อยู่ในบัญชีของคุณ" action={backLink} />
      ) : (
        <ErrorState message={entry.error} onRetry={() => void dispatch(fetchOrderDetail({ id: orderId, force: true }))} />
      );
    }
    if (!order) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[96px] rounded-2xl" />
          <Skeleton className="h-[280px] rounded-2xl" />
        </div>
      );
    }
    if (tracking) return <OrderTrackingView order={order} />;
    return (
      <>
        <OrderHeader order={order} />
        <ItemsSection order={order} />
        <TrackingSection order={order} />
        {order.shippingAddress && (
          <Section title="ที่อยู่สำหรับจัดส่ง">
            <p className="text-sm font-semibold text-ink">
              {order.shippingAddress.recipientName}
              <span className="ml-3 font-normal text-slate-500">{order.shippingAddress.phone}</span>
            </p>
            <p className="mt-1 text-sm text-[#2B3445]">{order.shippingAddress.address}</p>
          </Section>
        )}
      </>
    );
  };

  return (
    <AccountLayout
      title={tracking ? 'ติดตามสถานะการจัดส่ง' : 'รายละเอียดคำสั่งซื้อ'}
      titleNote={tracking ? '(Track Your Order)' : undefined}
      icon={tracking ? BsTruck : BsBoxSeamFill}
      description={tracking ? 'ตรวจสอบสถานะและรายละเอียดการจัดส่งสินค้า' : 'รายการสินค้า ยอดชำระ และสถานะของคำสั่งซื้อนี้'}
      actions={backLink}
    >
      {renderBody()}
    </AccountLayout>
  );
}

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
        <span className="h-5 w-1 rounded-full bg-brand" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function OrderHeader({ order }: { order: OrderDetail }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-ink">#{order.orderNumber}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <FiCalendar size={14} className="shrink-0 text-[#7D879C]" aria-hidden="true" />
          สั่งซื้อเมื่อ {formatOrderDateTime(order.placedAt)}
        </p>
      </div>
      <OrderStatusBadge status={order.status} />
    </div>
  );
}

function TrackingSection({ order }: { order: OrderDetail }) {
  return (
    <Section title="สถานะการจัดส่ง" id="tracking">
      {(order.carrier || order.trackingNumber) && (
        <dl className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm sm:grid-cols-2">
          {order.carrier && (
            <div>
              <dt className="text-xs text-slate-500">บริษัทขนส่ง</dt>
              <dd className="font-semibold text-ink">{order.carrier.name}</dd>
            </div>
          )}
          {order.trackingNumber && (
            <div>
              <dt className="text-xs text-slate-500">หมายเลขพัสดุ</dt>
              <dd className="font-semibold text-ink">{order.trackingNumber}</dd>
            </div>
          )}
        </dl>
      )}
      <OrderTrackingTimeline events={order.trackingEvents} />
    </Section>
  );
}

function ItemsSection({ order }: { order: OrderDetail }) {
  const rows: { label: string; value: string }[] = [
    { label: 'ราคาสินค้า', value: formatBaht(order.subtotal) },
    { label: 'ค่าจัดส่ง', value: order.shippingFee === 0 ? 'ฟรี' : formatBaht(order.shippingFee) },
    ...(order.discount > 0 ? [{ label: 'ส่วนลด', value: `-${formatBaht(order.discount)}` }] : []),
  ];
  return (
    <Section title={`รายการสินค้า (${order.items.length})`}>
      <ul className="flex flex-col divide-y divide-slate-100">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-4 py-3 first:pt-0">
            <OrderThumbnail src={item.imageUrl} alt={item.name} className="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-ink">{item.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatBaht(item.unitPrice)} x {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink">{formatBaht(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-[#2B3445]">{value}</dd>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-4">
          <dt className="font-semibold text-ink">ยอดรวมสุทธิ</dt>
          <dd className="text-lg font-bold text-brand">{formatBaht(order.total)}</dd>
        </div>
      </dl>
    </Section>
  );
}
