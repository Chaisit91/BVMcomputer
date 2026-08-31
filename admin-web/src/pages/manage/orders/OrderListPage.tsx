import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiEdit2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { getOrders, getOrderSummary, getOrderTotal } from '../../../services/order.service'
import { orderStatusMeta, paymentStatusMeta, type Order, type OrderStatus, type OrderSummary } from '../../../types/order'

type LoadStatus = 'loading' | 'error' | 'success'

const statusFilterOptions: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'สถานะคำสั่งซื้อทั้งหมด' },
  ...(Object.keys(orderStatusMeta) as OrderStatus[]).map((value) => ({ value, label: orderStatusMeta[value].label })),
]

function StatusChip({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export function OrderListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getOrderSummary(), getOrders()])
      .then(([summaryResult, ordersResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setOrders(ordersResult)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch =
        query === '' || order.orderCode.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'error' || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
          <p className="text-sm text-gray-400">ตรวจสอบและอัปเดตสถานะคำสั่งซื้อจากลูกค้าได้อย่างสะดวก</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <FiDownload size={16} />
          ส่งออกรายงาน
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatusChip dot={orderStatusMeta.pending_payment.dot} label={orderStatusMeta.pending_payment.label} value={String(summary.pendingPaymentCount)} />
        <StatusChip dot={orderStatusMeta.paid.dot} label={orderStatusMeta.paid.label} value={String(summary.paidCount)} />
        <StatusChip dot={orderStatusMeta.preparing.dot} label={orderStatusMeta.preparing.label} value={String(summary.preparingCount)} />
        <StatusChip dot={orderStatusMeta.shipping.dot} label={orderStatusMeta.shipping.label} value={String(summary.shippingCount)} />
        <StatusChip dot={orderStatusMeta.completed.dot} label={orderStatusMeta.completed.label} value={summary.completedCount.toLocaleString()} />
        <StatusChip dot={orderStatusMeta.cancelled.dot} label={orderStatusMeta.cancelled.label} value={String(summary.cancelledCount)} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหา Order ID หรือชื่อลูกค้า..."
            className="min-w-[260px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select disabled className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 outline-none">
            <option>24 ต.ค. 2023 - วันนี้</option>
          </select>
        </div>

        {visibleOrders.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบคำสั่งซื้อที่ค้นหา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Order ID</th>
                  <th className="pb-3 pr-4 font-medium">วันที่สั่งซื้อ</th>
                  <th className="pb-3 pr-4 font-medium">ชื่อลูกค้า</th>
                  <th className="pb-3 pr-4 font-medium">จำนวนสินค้า</th>
                  <th className="pb-3 pr-4 font-medium">ยอดรวม (฿)</th>
                  <th className="pb-3 pr-4 font-medium">วิธีชำระเงิน</th>
                  <th className="pb-3 pr-4 font-medium">สถานะชำระเงิน</th>
                  <th className="pb-3 pr-4 font-medium">สถานะคำสั่งซื้อ</th>
                  <th className="pb-3 pr-4 font-medium">เลขพัสดุ</th>
                  <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="whitespace-nowrap">
                    <td className="py-3 pr-4 font-medium text-rose-500">{order.orderCode}</td>
                    <td className="py-3 pr-4 text-gray-600">{order.orderedAt}</td>
                    <td className="py-3 pr-4 text-gray-800">{order.customerName}</td>
                    <td className="py-3 pr-4 text-gray-600">{order.items.length}</td>
                    <td className="py-3 pr-4 font-medium text-gray-800">{getOrderTotal(order).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-600">{order.paymentMethod}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={paymentStatusMeta[order.paymentStatus].variant}>
                        {paymentStatusMeta[order.paymentStatus].label}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={orderStatusMeta[order.status].variant}>{orderStatusMeta[order.status].label}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{order.trackingNumber || '-'}</td>
                    <td className="py-3 pr-4">
                      <Link
                        to={`/manage/orders/${order.id}/edit`}
                        className="inline-flex rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="แก้ไข"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">แสดง 1-{visibleOrders.length} จาก {orders.length.toLocaleString()} รายการ</p>
      </div>
    </main>
  )
}
