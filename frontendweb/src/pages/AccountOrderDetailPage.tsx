import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BsTruck } from 'react-icons/bs';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { OrderTrackingView } from '../components/account/OrderTrackingView';
import { RequireLogin } from '../components/account/RequireLogin';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrderDetail } from '../features/orderHistory/orderHistorySlice';

/**
 * One order's tracking page — the same page for every status ("ติดตามพัสดุ" and "ดูรายละเอียด"
 * both land here); the content follows the order's own data: on the way, or delivered.
 * Served at `/account/orders/:orderId` (and the older `/account/orders/:orderId/tracking`).
 */
export function AccountOrderDetailPage() {
  return (
    <RequireLogin>
      <OrderDetailContent />
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

function OrderDetailContent() {
  const dispatch = useAppDispatch();
  const { orderId = '' } = useParams();
  const entry = useAppSelector((state) => state.orderHistory.details[orderId]);

  useEffect(() => {
    if (orderId) void dispatch(fetchOrderDetail({ id: orderId }));
  }, [dispatch, orderId]);

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
    return <OrderTrackingView order={order} />;
  };

  return (
    <AccountLayout title="ติดตามสถานะการจัดส่ง" icon={BsTruck} description="ตรวจสอบสถานะและรายละเอียดการจัดส่งสินค้า" actions={backLink}>
      {renderBody()}
    </AccountLayout>
  );
}
