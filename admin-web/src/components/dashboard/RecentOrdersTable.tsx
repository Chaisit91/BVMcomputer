import { Badge } from '../ui/Badge'
import type { OrderStatus, RecentOrder } from '../../types/dashboard'

const statusMap: Record<OrderStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  success: { label: 'สำเร็จ', variant: 'success' },
  shipping: { label: 'กำลังจัดส่ง', variant: 'warning' },
  pending: { label: 'รอดำเนินการ', variant: 'neutral' },
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีคำสั่งซื้อ</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="pb-3 font-medium">เลขที่คำสั่งซื้อ</th>
            <th className="pb-3 font-medium">ลูกค้า</th>
            <th className="pb-3 font-medium">รายการสินค้า</th>
            <th className="pb-3 font-medium">ยอดรวม</th>
            <th className="pb-3 font-medium">สถานะ</th>
            <th className="pb-3 font-medium">วันที่</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-3 font-medium text-gray-800">{order.code}</td>
              <td className="py-3 text-gray-600">{order.customer}</td>
              <td className="py-3 text-gray-600">{order.item}</td>
              <td className="py-3 font-medium text-gray-800">{order.total.toLocaleString()}</td>
              <td className="py-3">
                <Badge variant={statusMap[order.status].variant}>{statusMap[order.status].label}</Badge>
              </td>
              <td className="py-3 text-gray-400">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
