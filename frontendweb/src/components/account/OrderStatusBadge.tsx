import type { IconType } from 'react-icons';
import { FiCheckCircle, FiPackage, FiTruck } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import type { OrderStatus } from '../../types/api';

const statusStyles: Record<OrderStatus, { label: string; icon: IconType; className: string }> = {
  to_ship: { label: 'รอจัดส่ง', icon: FiPackage, className: 'bg-amber-50 text-amber-700' },
  shipping: { label: 'กำลังนำส่งพัสดุ', icon: FiTruck, className: 'bg-blue-50 text-blue-600' },
  delivered: { label: 'จัดส่งสำเร็จ', icon: FiCheckCircle, className: 'bg-emerald-50 text-emerald-700' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, className } = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', className)}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}
