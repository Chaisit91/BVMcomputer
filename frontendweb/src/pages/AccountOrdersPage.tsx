import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BsBoxSeamFill } from 'react-icons/bs';
import { FiPackage } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { OrderCard } from '../components/account/OrderCard';
import { RequireLogin } from '../components/account/RequireLogin';
import { ORDER_STATUS_TABS, isOrderStatus } from '../components/account/orderFormat';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { cn } from '../lib/cn';
import { fetchOrders } from '../features/orderHistory/orderHistorySlice';
import type { OrderStatus } from '../types/api';

/** "รายการของฉัน › คำสั่งซื้อ" — order history, filterable by delivery status. */
export function AccountOrdersPage() {
  return (
    <RequireLogin>
      <OrdersContent />
    </RequireLogin>
  );
}

function OrdersContent() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.orderHistory);
  // The tab lives in the URL (?status=shipping) so Back from an order returns to the same tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const activeTab: OrderStatus | 'all' = isOrderStatus(statusParam) ? statusParam : 'all';

  useEffect(() => {
    void dispatch(fetchOrders());
  }, [dispatch]);

  const loaded = status === 'succeeded';
  const countOf = (tab: OrderStatus | 'all') => (tab === 'all' ? orders.length : orders.filter((order) => order.status === tab).length);
  const visible = activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab);
  const tabs: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    ...ORDER_STATUS_TABS.map(({ status: key, label }) => ({ key, label })),
  ];

  const selectTab = (key: OrderStatus | 'all') =>
    setSearchParams(key === 'all' ? {} : { status: key }, { replace: true, preventScrollReset: true });

  const renderBody = () => {
    if (status === 'failed') return <ErrorState message={error} onRetry={() => void dispatch(fetchOrders({ force: true }))} />;
    if (!loaded) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[136px] rounded-2xl" />
          <Skeleton className="h-[136px] rounded-2xl" />
        </div>
      );
    }
    if (orders.length === 0) {
      return (
        <EmptyState
          icon={FiPackage}
          title="ยังไม่มีคำสั่งซื้อ"
          description="เมื่อคุณสั่งซื้อสินค้า รายการคำสั่งซื้อและสถานะการจัดส่งจะแสดงที่นี่"
          action={
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              เลือกซื้อสินค้า
            </Link>
          }
        />
      );
    }
    if (visible.length === 0) {
      return <EmptyState icon={FiPackage} title="ไม่มีคำสั่งซื้อในสถานะนี้" className="py-12" />;
    }
    return (
      <div className="flex flex-col gap-4">
        {visible.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

  return (
    <AccountLayout title="คำสั่งซื้อของฉัน" icon={BsBoxSeamFill} description="ตรวจสอบประวัติการสั่งซื้อและติดตามสถานะคำสั่งซื้อของคุณ">
      <div role="tablist" aria-label="กรองตามสถานะคำสั่งซื้อ" className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map(({ key, label }) => {
          const active = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(key)}
              className={cn(
                'flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors',
                active ? 'bg-brand text-white shadow-sm' : 'border border-slate-200 bg-white text-[#2B3445] hover:border-brand/40 hover:text-brand',
              )}
            >
              {label}
              {loaded && ` (${countOf(key)})`}
            </button>
          );
        })}
      </div>

      {renderBody()}
    </AccountLayout>
  );
}
